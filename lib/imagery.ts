import type { Episode } from "@/types/episode";

export const IMAGERY_COOKIE = "dd_imagery";
export const IMAGERY_IDS = ["photos", "illustrations", "collage", "mix"] as const;
export const DEFAULT_IMAGERY: Imagery = "photos";

export type Imagery = (typeof IMAGERY_IDS)[number];

export const IMAGERY_LABELS: Record<Imagery, string> = {
  photos: "Photos",
  illustrations: "Illustrations",
  collage: "Collage",
  mix: "Mix",
};

/** The two AI image styles stored per story (photos are the original scraped images). */
export const GENERATED_IMAGE_STYLES = ["illustration", "collage"] as const;
export type GeneratedImageStyle = (typeof GENERATED_IMAGE_STYLES)[number];

export const GENERATED_IMAGE_LABELS: Record<GeneratedImageStyle, string> = {
  illustration: "Illustration",
  collage: "Collage",
};

export function isImagery(value: unknown): value is Imagery {
  return typeof value === "string" && (IMAGERY_IDS as readonly string[]).includes(value);
}

export function isGeneratedImageStyle(value: unknown): value is GeneratedImageStyle {
  return typeof value === "string" && (GENERATED_IMAGE_STYLES as readonly string[]).includes(value);
}

export function parseImagery(value: string | undefined | null): Imagery {
  return isImagery(value) ? value : DEFAULT_IMAGERY;
}

export function hasGeneratedImage(episode: Episode, style: GeneratedImageStyle): boolean {
  return Boolean(style === "illustration" ? episode.illustrationUrl : episode.collageUrl);
}

type MixKind = "photos" | "illustrations" | "collage";

/** Stable 1/3 split so Mix doesn't reshuffle on every load. */
function mixKind(id: string): MixKind {
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = (hash * 31 + id.charCodeAt(i)) >>> 0;
  }
  return (["photos", "illustrations", "collage"] as const)[hash % 3];
}

function firstAvailable(
  episode: Episode,
  order: Array<"photo" | "illustration" | "collage">,
): string | null {
  for (const kind of order) {
    const url =
      kind === "photo" ? episode.photoUrl : kind === "illustration" ? episode.illustrationUrl : episode.collageUrl;
    if (url) return url;
  }
  return null;
}

/** The image the public site shows for a story; falls back to the original photo until an AI one exists. */
export function imageForImagery(episode: Episode, imagery: Imagery): string | null {
  if (imagery === "illustrations") return episode.illustrationUrl ?? episode.photoUrl;
  if (imagery === "collage") return episode.collageUrl ?? episode.photoUrl;
  if (imagery === "mix") {
    const kind = mixKind(episode.id);
    // Prefer an AI image when the assigned type is missing, so Mix doesn't
    // drop back to a scraped news photo unless that's all the story has.
    if (kind === "illustrations") return firstAvailable(episode, ["illustration", "collage", "photo"]);
    if (kind === "collage") return firstAvailable(episode, ["collage", "illustration", "photo"]);
    return firstAvailable(episode, ["photo", "illustration", "collage"]);
  }
  return episode.photoUrl;
}
