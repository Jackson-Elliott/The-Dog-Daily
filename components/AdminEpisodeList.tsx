"use client";

import { useState } from "react";
import type { Episode } from "@/types/episode";
import { formatEpisodeDate, isScheduledDraft } from "@/lib/format";
import AdminEpisodeEditor from "@/components/AdminEpisodeEditor";
import AdminPublishSwitch from "@/components/AdminPublishSwitch";
import { adminGhostPillClass, adminMutedClass } from "@/components/admin-ui";

export default function AdminEpisodeList({
  episodes,
  onUpdated,
  onDeleted,
}: {
  episodes: Episode[];
  onUpdated: (episode: Episode) => void;
  onDeleted: (id: string) => void;
}) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleDelete(id: string, scriptName: string) {
    if (!window.confirm(`Delete "${scriptName}"? This cannot be undone.`)) return;

    setDeletingId(id);
    setError(null);
    try {
      const response = await fetch(`/api/admin/episodes/${id}`, { method: "DELETE" });
      const body = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(body.error ?? "Failed to delete episode.");
      if (editingId === id) setEditingId(null);
      onDeleted(id);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete episode.");
    } finally {
      setDeletingId(null);
    }
  }

  async function handlePublishedChange(episode: Episode, published: boolean) {
    setSavingId(episode.id);
    setError(null);
    try {
      const formData = new FormData();
      formData.set("scriptName", episode.scriptName);
      formData.set("airDate", episode.airDate);
      formData.set("sourceUrl", episode.sourceUrl ?? "");
      formData.set("headline", episode.headline ?? "");
      formData.set("category", episode.category ?? "");
      if (episode.photoUrl) formData.set("photoImageUrl", episode.photoUrl);
      formData.set("published", published ? "true" : "false");

      const response = await fetch(`/api/admin/episodes/${episode.id}`, {
        method: "PATCH",
        body: formData,
      });
      const body = await response.json();
      if (!response.ok) throw new Error(body.error ?? "Failed to update status.");
      onUpdated(body.episode as Episode);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update status.");
    } finally {
      setSavingId(null);
    }
  }

  return (
    <div>
      <h2 className="text-3xl font-bold text-white">Stories</h2>
      <p className="mt-2 text-sm text-white/60">
        Newest live date first. Drafts stay off the public site. A published story
        with a future air date still waits until that morning (Sydney time).
      </p>

      {error ? <p className="mt-3 text-sm text-white">{error}</p> : null}

      {episodes.length === 0 ? (
        <p className="mt-4 text-sm text-white/60">No episodes yet — upload the first one above.</p>
      ) : (
        <ul className="mt-8">
          {episodes.map((episode, index) => {
            const headline = episode.headline ?? episode.scriptName;
            const isEditing = editingId === episode.id;

            return (
              <li
                key={episode.id}
                className={index > 0 ? "mt-8 border-t border-white pt-8" : undefined}
              >
                <div className="flex flex-col gap-4 sm:flex-row">
                  <div className="relative aspect-[16/9] w-full shrink-0 overflow-hidden bg-white/10 sm:w-56">
                    {episode.photoUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element -- arbitrary remote preview, not an optimized asset
                      <img src={episode.photoUrl} alt={headline} className="h-full w-full object-cover" />
                    ) : (
                      <div className="flex h-full items-center justify-center text-xs text-white/40">
                        No photo
                      </div>
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-bold text-white">
                      {formatEpisodeDate(episode.airDate)}
                      {!episode.published ? (
                        <span className="ml-2 font-medium text-white/50">Draft</span>
                      ) : isScheduledDraft(episode.airDate) ? (
                        <span className="ml-2 font-medium text-white/50">Scheduled</span>
                      ) : (
                        <span className="ml-2 font-medium text-white/50">Live</span>
                      )}
                    </p>
                    <p className="mt-1 text-xl font-bold leading-[1.15] text-white">{headline}</p>
                    <p className={`mt-1 ${adminMutedClass}`}>
                      {episode.scriptName}
                      {episode.category ? ` · ${episode.category}` : ""}
                    </p>
                    {episode.sourceUrl ? (
                      <a
                        href={episode.sourceUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-1 inline-block truncate text-xs text-white/60 underline hover:no-underline"
                      >
                        {episode.sourceUrl}
                      </a>
                    ) : null}
                    <audio controls preload="metadata" src={episode.audioUrl} className="mt-3 w-full" />

                    <div className="mt-4">
                      <AdminPublishSwitch
                        id={`list-published-${episode.id}`}
                        published={episode.published}
                        disabled={savingId === episode.id}
                        onChange={(published) => handlePublishedChange(episode, published)}
                      />
                    </div>

                    <div className="mt-4 flex gap-2">
                      <button
                        type="button"
                        onClick={() => setEditingId(isEditing ? null : episode.id)}
                        className={adminGhostPillClass}
                      >
                        {isEditing ? "Close" : "Edit"}
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(episode.id, episode.scriptName)}
                        disabled={deletingId === episode.id}
                        className={adminGhostPillClass}
                      >
                        {deletingId === episode.id ? "Deleting..." : "Delete"}
                      </button>
                    </div>
                  </div>
                </div>

                {isEditing ? (
                  <AdminEpisodeEditor
                    key={episode.id}
                    episode={episode}
                    onSaved={(updated) => {
                      onUpdated(updated);
                      setEditingId(null);
                    }}
                    onCancel={() => setEditingId(null)}
                  />
                ) : null}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
