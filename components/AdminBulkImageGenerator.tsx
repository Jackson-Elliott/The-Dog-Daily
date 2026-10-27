"use client";

import { useRef, useState } from "react";
import type { Episode } from "@/types/episode";
import { GENERATED_IMAGE_STYLES, hasGeneratedImage, type GeneratedImageStyle } from "@/lib/imagery";
import { requestGeneratedImage } from "@/components/AdminGeneratedImages";
import { adminGhostPillClass, adminMutedClass } from "@/components/admin-ui";

interface Job {
  id: string;
  style: GeneratedImageStyle;
}

/**
 * Fills in every missing illustration and collage, one image at a time so a
 * long run never hits a request timeout or rate limit. Stopping finishes the
 * image in progress, then halts.
 */
export default function AdminBulkImageGenerator({
  episodes,
  onUpdated,
}: {
  episodes: Episode[];
  onUpdated: (episode: Episode) => void;
}) {
  const [progress, setProgress] = useState<{ done: number; total: number } | null>(null);
  const [failures, setFailures] = useState<string[]>([]);
  const [isStopping, setIsStopping] = useState(false);
  const stopRef = useRef(false);

  const missing: Job[] = episodes.flatMap((episode) =>
    GENERATED_IMAGE_STYLES.filter((style) => !hasGeneratedImage(episode, style)).map((style) => ({
      id: episode.id,
      style,
    })),
  );
  const isRunning = progress !== null;

  async function run() {
    const jobs = missing;
    if (jobs.length === 0) return;
    if (!window.confirm(`Generate ${jobs.length} images with OpenAI? This uses paid API credits.`)) return;

    stopRef.current = false;
    setIsStopping(false);
    setFailures([]);
    setProgress({ done: 0, total: jobs.length });

    for (const [index, job] of jobs.entries()) {
      if (stopRef.current) break;
      try {
        onUpdated(await requestGeneratedImage(job.id, job.style));
      } catch (err) {
        const headline = episodes.find((episode) => episode.id === job.id)?.headline ?? job.id;
        const reason = err instanceof Error ? err.message : "failed";
        setFailures((prev) => [...prev, `${headline} (${job.style}): ${reason}`]);
      }
      setProgress({ done: index + 1, total: jobs.length });
    }

    setProgress(null);
    setIsStopping(false);
  }

  function stop() {
    stopRef.current = true;
    setIsStopping(true);
  }

  return (
    <div className="mt-6">
      <div className="flex flex-wrap items-center gap-3">
        {isRunning ? (
          <button type="button" onClick={stop} disabled={isStopping} className={adminGhostPillClass}>
            {isStopping ? "Stopping..." : "Stop"}
          </button>
        ) : (
          <button type="button" onClick={run} disabled={missing.length === 0} className={adminGhostPillClass}>
            Generate all missing images
          </button>
        )}
        <p className={adminMutedClass}>
          {progress
            ? `Generating ${progress.done} / ${progress.total}`
            : missing.length === 0
              ? "Every story has an illustration and a collage."
              : `${missing.length} images missing`}
        </p>
      </div>
      {failures.length > 0 ? (
        <ul className="mt-2 space-y-1 text-xs text-white/70">
          {failures.map((failure) => (
            <li key={failure}>{failure}</li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
