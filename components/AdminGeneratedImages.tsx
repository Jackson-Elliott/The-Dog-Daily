"use client";

import { useState } from "react";
import type { Episode } from "@/types/episode";
import { GENERATED_IMAGE_LABELS, GENERATED_IMAGE_STYLES, type GeneratedImageStyle } from "@/lib/imagery";
import { adminGhostPillClass, adminLabelClass, adminMutedClass } from "@/components/admin-ui";

export async function requestGeneratedImage(id: string, style: GeneratedImageStyle): Promise<Episode> {
  const response = await fetch(`/api/admin/episodes/${id}/generate-image`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ style }),
  });
  const body = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(body.error ?? "Failed to generate image.");
  return body.episode as Episode;
}

function fileStem(headline: string) {
  return (
    headline
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 60) || "image"
  );
}

function extensionFrom(url: string, mime: string) {
  try {
    const match = new URL(url).pathname.match(/\.(png|jpe?g|webp|gif)$/i);
    if (match) return match[1].toLowerCase() === "jpeg" ? "jpg" : match[1].toLowerCase();
  } catch {
    /* keep going from the MIME type */
  }
  if (mime.includes("png")) return "png";
  if (mime.includes("webp")) return "webp";
  if (mime.includes("gif")) return "gif";
  return "jpg";
}

async function downloadImage(url: string, name: string) {
  const response = await fetch(url);
  if (!response.ok) throw new Error("Couldn't download the image.");
  const blob = await response.blob();
  const objectUrl = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = objectUrl;
  link.download = `${name}.${extensionFrom(url, blob.type)}`;
  link.click();
  URL.revokeObjectURL(objectUrl);
}

function Thumbnail({ src, alt, label }: { src: string | null; alt: string; label: string }) {
  return (
    <div className="relative aspect-[16/9] w-full overflow-hidden bg-white/10">
      {src ? (
        // eslint-disable-next-line @next/next/no-img-element -- arbitrary remote preview, not an optimized asset
        <img src={src} alt={alt} className="h-full w-full object-cover" />
      ) : (
        <div className="flex h-full items-center justify-center text-xs text-white/40">No {label.toLowerCase()} yet</div>
      )}
    </div>
  );
}

/**
 * The original photo next to its AI illustration and collage. Generating saves
 * straight to the story, separately from the editor's Save changes button.
 */
export default function AdminGeneratedImages({
  episode,
  onUpdated,
}: {
  episode: Episode;
  onUpdated: (episode: Episode) => void;
}) {
  const [generating, setGenerating] = useState<GeneratedImageStyle | null>(null);
  const [error, setError] = useState<string | null>(null);
  const headline = episode.headline ?? episode.scriptName;
  const photoUrl = episode.photoUrl;

  async function generate(style: GeneratedImageStyle) {
    setGenerating(style);
    setError(null);
    try {
      onUpdated(await requestGeneratedImage(episode.id, style));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to generate image.");
    } finally {
      setGenerating(null);
    }
  }

  async function download(url: string, kind: string) {
    setError(null);
    try {
      await downloadImage(url, `${fileStem(headline)}-${kind}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't download the image.");
    }
  }

  return (
    <div>
      <p className={adminLabelClass}>Images</p>
      <p className={`mt-1 ${adminMutedClass}`}>
        The imagery switch at the top of admin picks which one the site shows. Stories without an AI image keep
        showing the photo.
      </p>
      <div className="mt-3 grid gap-4 sm:grid-cols-3">
        <div>
          <Thumbnail src={photoUrl} alt={headline} label="Photo" />
          <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
            <p className={adminMutedClass}>Photo</p>
            {photoUrl ? (
              <button type="button" onClick={() => download(photoUrl, "photo")} className={adminGhostPillClass}>
                Download
              </button>
            ) : null}
          </div>
        </div>
        {GENERATED_IMAGE_STYLES.map((style) => {
          const src = style === "illustration" ? episode.illustrationUrl : episode.collageUrl;
          const label = GENERATED_IMAGE_LABELS[style];
          return (
            <div key={style}>
              <Thumbnail src={src} alt={`${label}: ${headline}`} label={label} />
              <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
                <p className={adminMutedClass}>{label}</p>
                <div className="flex flex-wrap gap-2">
                  {src ? (
                    <button type="button" onClick={() => download(src, style)} className={adminGhostPillClass}>
                      Download
                    </button>
                  ) : null}
                  <button
                    type="button"
                    onClick={() => generate(style)}
                    disabled={generating !== null}
                    className={adminGhostPillClass}
                  >
                    {generating === style ? "Generating..." : src ? "Regenerate" : "Generate"}
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
      {error ? <p className="mt-2 text-sm text-white">{error}</p> : null}
    </div>
  );
}
