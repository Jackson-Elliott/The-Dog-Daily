import crypto from "crypto";
import { AUDIO_BUCKET, PHOTOS_BUCKET, getSupabaseAdminClient } from "@/lib/supabase";
import { mockEpisodes } from "@/lib/mock-episodes";
import { publishedEpisodes, sortEpisodesByAirDate } from "@/lib/format";
import type { Episode } from "@/types/episode";

/**
 * Temporary escape hatch to preview the site with placeholder episodes before
 * Supabase is set up. Set USE_MOCK_EPISODES=true in .env.local to enable; unset
 * (or remove the var) once real episodes are uploaded. Only affects reads —
 * creating/deleting episodes still requires a real Supabase project.
 */
function isMockEpisodesEnabled(): boolean {
  return process.env.USE_MOCK_EPISODES === "true";
}

// Mutable copy so admin edits/deletes in mock mode actually change what
// listEpisodes returns for the life of the server process. The original
// mockEpisodes array stays as the seed. The public homepage only sees
// episodes whose air date is today or earlier (Sydney); pass
// { includeScheduled: true } in admin to include future drafts.
let mockEpisodeStore: Episode[] | null = null;

function getMockEpisodeStore(): Episode[] {
  if (!mockEpisodeStore) {
    mockEpisodeStore = mockEpisodes.map((episode) => ({ ...episode }));
  }
  return mockEpisodeStore;
}

interface EpisodeRow {
  id: string;
  script_name: string;
  air_date: string;
  audio_url: string;
  source_url: string | null;
  headline: string | null;
  photo_url: string | null;
  category: string | null;
  created_at: string;
}

function rowToEpisode(row: EpisodeRow): Episode {
  return {
    id: row.id,
    scriptName: row.script_name,
    airDate: row.air_date,
    audioUrl: row.audio_url,
    sourceUrl: row.source_url,
    headline: row.headline,
    photoUrl: row.photo_url,
    category: row.category,
    createdAt: row.created_at,
  };
}

export async function listEpisodes(options?: { includeScheduled?: boolean }): Promise<Episode[]> {
  const episodes = isMockEpisodesEnabled()
    ? sortEpisodesByAirDate(getMockEpisodeStore())
    : await listEpisodesFromSupabase();

  return options?.includeScheduled ? episodes : publishedEpisodes(episodes);
}

async function listEpisodesFromSupabase(): Promise<Episode[]> {
  const supabase = getSupabaseAdminClient();
  const { data, error } = await supabase
    .from("episodes")
    .select("*")
    .order("air_date", { ascending: false })
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(`Failed to load episodes: ${error.message}`);
  }

  return (data as EpisodeRow[]).map(rowToEpisode);
}

const EXTENSION_BY_CONTENT_TYPE: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/jpg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
};

function extensionFromName(name: string, fallback: string): string {
  const match = /\.([a-zA-Z0-9]+)$/.exec(name);
  return match ? match[1].toLowerCase() : fallback;
}

function extensionFromContentType(contentType: string | null, fallback: string): string {
  if (!contentType) return fallback;
  const bare = contentType.split(";")[0]?.trim() ?? "";
  return EXTENSION_BY_CONTENT_TYPE[bare] ?? fallback;
}

export interface CreateEpisodeInput {
  scriptName: string;
  airDate: string;
  sourceUrl: string | null;
  headline: string | null;
  /** One of the curated CATEGORIES in lib/categories.ts, or null if unset. */
  category: string | null;
  /** Remote URL of a scraped news photo to download and re-host in our own storage. */
  photoImageUrl: string | null;
  /** Local cover image chosen in admin; takes precedence over photoImageUrl. */
  photoFile: File | null;
  audioFile: File;
}

export interface UpdateEpisodeInput {
  scriptName: string;
  airDate: string;
  sourceUrl: string | null;
  headline: string | null;
  category: string | null;
  /**
   * If set and different from the current photo, this URL is downloaded and
   * re-hosted (or stored as-is in mock mode). Pass the existing photo URL to
   * leave the image unchanged.
   */
  photoImageUrl: string | null;
  /** Local cover image; takes precedence over photoImageUrl when present. */
  photoFile: File | null;
  /** Optional replacement audio. Omit/null to keep the current file. */
  audioFile: File | null;
}

async function fileToDataUrl(file: File): Promise<string> {
  const bytes = Buffer.from(await file.arrayBuffer());
  const type = file.type || "image/jpeg";
  return `data:${type};base64,${bytes.toString("base64")}`;
}

async function uploadPhotoFile(photoFile: File, airDate: string, id: string): Promise<string> {
  const supabase = getSupabaseAdminClient();
  const photoExt = extensionFromName(photoFile.name, extensionFromContentType(photoFile.type, "jpg"));
  const photoPath = `${airDate}-${id}.${photoExt}`;
  const photoBuffer = Buffer.from(await photoFile.arrayBuffer());

  const { error: photoError } = await supabase.storage.from(PHOTOS_BUCKET).upload(photoPath, photoBuffer, {
    contentType: photoFile.type || "image/jpeg",
    upsert: true,
  });
  if (photoError) {
    throw new Error(`Failed to upload cover image: ${photoError.message}`);
  }
  return supabase.storage.from(PHOTOS_BUCKET).getPublicUrl(photoPath).data.publicUrl;
}

async function rehostPhoto(photoImageUrl: string, airDate: string, id: string): Promise<string | null> {
  try {
    const supabase = getSupabaseAdminClient();
    const photoResponse = await fetch(photoImageUrl);
    if (!photoResponse.ok) return null;

    const contentType = photoResponse.headers.get("content-type");
    const photoExt = extensionFromContentType(contentType, "jpg");
    const photoPath = `${airDate}-${id}.${photoExt}`;
    const photoBuffer = Buffer.from(await photoResponse.arrayBuffer());

    const { error: photoError } = await supabase.storage.from(PHOTOS_BUCKET).upload(photoPath, photoBuffer, {
      contentType: contentType ?? "image/jpeg",
      upsert: true,
    });
    if (photoError) return null;

    return supabase.storage.from(PHOTOS_BUCKET).getPublicUrl(photoPath).data.publicUrl;
  } catch {
    return null;
  }
}

async function uploadAudio(audioFile: File, airDate: string, id: string): Promise<string> {
  const supabase = getSupabaseAdminClient();
  const audioExt = extensionFromName(audioFile.name, "mp3");
  const audioPath = `${airDate}-${id}.${audioExt}`;
  const audioBuffer = Buffer.from(await audioFile.arrayBuffer());

  const { error: audioError } = await supabase.storage.from(AUDIO_BUCKET).upload(audioPath, audioBuffer, {
    contentType: audioFile.type || "audio/mpeg",
    upsert: true,
  });
  if (audioError) {
    throw new Error(`Failed to upload audio file: ${audioError.message}`);
  }
  return supabase.storage.from(AUDIO_BUCKET).getPublicUrl(audioPath).data.publicUrl;
}

/**
 * Uploads the audio file (and, best-effort, re-hosts the scraped photo) to Supabase
 * Storage, then inserts the episode row. If the photo download fails for any reason
 * the episode is still created without a photo rather than failing the whole upload.
 */
export async function createEpisode(input: CreateEpisodeInput): Promise<Episode> {
  const supabase = getSupabaseAdminClient();
  const id = crypto.randomUUID();
  const audioUrl = await uploadAudio(input.audioFile, input.airDate, id);
  const photoUrl = input.photoFile
    ? await uploadPhotoFile(input.photoFile, input.airDate, id)
    : input.photoImageUrl
      ? await rehostPhoto(input.photoImageUrl, input.airDate, id)
      : null;

  const { data, error } = await supabase
    .from("episodes")
    .insert({
      id,
      script_name: input.scriptName,
      air_date: input.airDate,
      audio_url: audioUrl,
      source_url: input.sourceUrl,
      headline: input.headline,
      category: input.category,
      photo_url: photoUrl,
    })
    .select("*")
    .single();

  if (error) {
    throw new Error(`Failed to save episode: ${error.message}`);
  }

  return rowToEpisode(data as EpisodeRow);
}

export async function updateEpisode(id: string, input: UpdateEpisodeInput): Promise<Episode> {
  if (isMockEpisodesEnabled()) {
    const store = getMockEpisodeStore();
    const index = store.findIndex((episode) => episode.id === id);
    if (index === -1) throw new Error("Episode not found.");
    if (input.audioFile) {
      throw new Error("Replacing audio isn't available while mock episodes are enabled.");
    }

    const current = store[index];
    const updated: Episode = {
      ...current,
      scriptName: input.scriptName,
      airDate: input.airDate,
      sourceUrl: input.sourceUrl,
      headline: input.headline,
      category: input.category,
      photoUrl: input.photoFile
        ? await fileToDataUrl(input.photoFile)
        : (input.photoImageUrl ?? current.photoUrl),
    };
    store[index] = updated;
    return updated;
  }

  const supabase = getSupabaseAdminClient();
  const { data: existing, error: loadError } = await supabase
    .from("episodes")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (loadError) {
    throw new Error(`Failed to load episode: ${loadError.message}`);
  }
  if (!existing) {
    throw new Error("Episode not found.");
  }

  const current = rowToEpisode(existing as EpisodeRow);
  const patch: Record<string, string | null> = {
    script_name: input.scriptName,
    air_date: input.airDate,
    source_url: input.sourceUrl,
    headline: input.headline,
    category: input.category,
  };

  if (input.audioFile) {
    patch.audio_url = await uploadAudio(input.audioFile, input.airDate, id);
  }

  if (input.photoFile) {
    patch.photo_url = await uploadPhotoFile(input.photoFile, input.airDate, id);
  } else if (input.photoImageUrl && input.photoImageUrl !== current.photoUrl) {
    const rehosted = await rehostPhoto(input.photoImageUrl, input.airDate, id);
    if (rehosted) patch.photo_url = rehosted;
  }

  const { data, error } = await supabase.from("episodes").update(patch).eq("id", id).select("*").single();
  if (error) {
    throw new Error(`Failed to update episode: ${error.message}`);
  }

  return rowToEpisode(data as EpisodeRow);
}

export async function deleteEpisode(id: string): Promise<void> {
  if (isMockEpisodesEnabled()) {
    const store = getMockEpisodeStore();
    const index = store.findIndex((episode) => episode.id === id);
    if (index === -1) throw new Error("Episode not found.");
    store.splice(index, 1);
    return;
  }

  const supabase = getSupabaseAdminClient();
  const { error } = await supabase.from("episodes").delete().eq("id", id);
  if (error) {
    throw new Error(`Failed to delete episode: ${error.message}`);
  }
  // Note: the underlying audio/photo files are intentionally left in Storage;
  // remove them manually from the Supabase dashboard if you want to reclaim space.
}
