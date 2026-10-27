import { readFile } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";
import { GENERATED_IMAGES_BUCKET, getSupabaseAdminClient } from "@/lib/supabase";
import { buildImagePrompt } from "@/lib/image-prompts";
import type { GeneratedImageStyle } from "@/lib/imagery";
import type { Episode } from "@/types/episode";

const OPENAI_IMAGES_URL = "https://api.openai.com/v1/images";
const DEFAULT_IMAGE_MODEL = "gpt-image-2.5-sunburst";
/** 16:9, matching the crops used across the site. */
const DEFAULT_IMAGE_SIZE = "1536x864";
const IMAGE_QUALITY = "high";
const OUTPUT_FORMAT = "webp";
const STYLE_REFERENCE_FILES: Record<GeneratedImageStyle, string> = {
  collage: path.join(process.cwd(), "assets", "collage-style-reference.jpg"),
  illustration: path.join(process.cwd(), "assets", "illustration-style-reference.jpg"),
};

type ReferenceImage = { bytes: Buffer; type: string; filename: string };

const OPENAI_IMAGE_TYPES = new Set(["image/jpeg", "image/png", "image/webp", "image/gif"]);

function requireApiKey(): string {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error(
      "Missing required environment variable: OPENAI_API_KEY. Copy .env.local.example to .env.local and fill it in.",
    );
  }
  return apiKey;
}

async function ensureOpenAiImage(bytes: Buffer, declaredType: string): Promise<ReferenceImage> {
  const type = declaredType.split(";")[0].trim().toLowerCase();
  const normalized = type === "image/jpg" ? "image/jpeg" : type;
  if (OPENAI_IMAGE_TYPES.has(normalized)) {
    const ext = normalized === "image/jpeg" ? "jpg" : normalized.slice("image/".length);
    return { bytes, type: normalized, filename: `news-photo.${ext}` };
  }
  const converted = await sharp(bytes).jpeg({ quality: 90 }).toBuffer();
  return { bytes: converted, type: "image/jpeg", filename: "news-photo.jpg" };
}

async function downloadPhoto(url: string): Promise<ReferenceImage> {
  const photo = await fetch(url);
  if (!photo.ok) throw new Error(`Couldn't download the reference photo (${photo.status}).`);
  const type = photo.headers.get("content-type") ?? "image/jpeg";
  return ensureOpenAiImage(Buffer.from(await photo.arrayBuffer()), type);
}

async function loadStyleReference(style: GeneratedImageStyle): Promise<ReferenceImage> {
  const file = STYLE_REFERENCE_FILES[style];
  try {
    const bytes = await readFile(file);
    return { bytes, type: "image/jpeg", filename: "style-reference.jpg" };
  } catch {
    throw new Error(`Couldn't read the ${style} style reference at ${file}.`);
  }
}

function softenForSafety(text: string | null | undefined): string | null {
  if (!text) return text ?? null;
  return text
    .replace(/\bunsolicited\s+nudes?\b/gi, "inappropriate post")
    .replace(/\b(beautiful\s+)?ass\b/gi, "appearance")
    .replace(/\bnudes?\b/gi, "photo")
    .replace(/\bnaked\b/gi, "unclothed")
    .replace(/\bsex(ual|ually)?\b/gi, "")
    .replace(/\s+/g, " ")
    .trim();
}

async function requestImage(prompt: string, references: ReferenceImage[]): Promise<Buffer> {
  const apiKey = requireApiKey();
  const model = process.env.OPENAI_IMAGE_MODEL || DEFAULT_IMAGE_MODEL;
  const size = process.env.OPENAI_IMAGE_SIZE || DEFAULT_IMAGE_SIZE;

  let response: Response;
  if (references.length > 0) {
    const form = new FormData();
    form.set("model", model);
    form.set("prompt", prompt);
    form.set("size", size);
    form.set("quality", IMAGE_QUALITY);
    form.set("output_format", OUTPUT_FORMAT);
    for (const reference of references) {
      form.append("image[]", new Blob([new Uint8Array(reference.bytes)], { type: reference.type }), reference.filename);
    }
    response = await fetch(`${OPENAI_IMAGES_URL}/edits`, {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}` },
      body: form,
    });
  } else {
    response = await fetch(`${OPENAI_IMAGES_URL}/generations`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
      body: JSON.stringify({ model, prompt, size, quality: IMAGE_QUALITY, output_format: OUTPUT_FORMAT, n: 1 }),
    });
  }

  if (!response.ok) {
    const detail = await response.text().catch(() => "");
    throw new Error(`Image generation failed (${response.status}): ${detail.slice(0, 300)}`);
  }

  const body = await response.json();
  const b64: string | undefined = body?.data?.[0]?.b64_json;
  if (!b64) throw new Error("Image generation returned no image.");
  return Buffer.from(b64, "base64");
}

/**
 * Generates one AI image for a story in the given style and uploads it to the
 * generated-images bucket. Returns its public URL; the caller saves it on the story.
 */
export async function generateStoryImage(episode: Episode, style: GeneratedImageStyle): Promise<string> {
  const { prompt, useReferencePhoto, useStyleReference } = buildImagePrompt(episode, style);
  if (useReferencePhoto && !episode.photoUrl) {
    throw new Error("This style works from the story's photo, but the story has no photo.");
  }

  const references: ReferenceImage[] = [];
  if (useReferencePhoto && episode.photoUrl) {
    references.push(await downloadPhoto(episode.photoUrl));
  }
  if (useStyleReference) {
    references.push(await loadStyleReference(style));
  }

  let image: Buffer;
  try {
    image = await requestImage(prompt, references);
  } catch (error) {
    const safetyBlocked =
      error instanceof Error && error.message.includes("rejected by the safety system");
    if (!safetyBlocked) throw error;
    const fallbackRefs = useStyleReference ? [await loadStyleReference(style)] : [];
    const retry = buildImagePrompt(
      {
        ...episode,
        headline: softenForSafety(episode.headline ?? episode.scriptName),
        summary: softenForSafety(episode.summary),
      },
      style,
    );
    image = await requestImage(
      `${retry.prompt}\n\nDo not depict nudity, sexual content, or graphic injury. Keep the image editorial and non-explicit.`,
      fallbackRefs,
    );
  }

  const supabase = getSupabaseAdminClient();
  const pathName = `${episode.id}/${style}-${Date.now()}.${OUTPUT_FORMAT}`;
  const { error } = await supabase.storage
    .from(GENERATED_IMAGES_BUCKET)
    .upload(pathName, image, { contentType: `image/${OUTPUT_FORMAT}`, upsert: true });
  if (error) {
    throw new Error(`Failed to upload generated image: ${error.message}`);
  }
  return supabase.storage.from(GENERATED_IMAGES_BUCKET).getPublicUrl(pathName).data.publicUrl;
}
