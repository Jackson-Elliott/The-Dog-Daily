"use client";

import { useState, type FormEvent } from "react";
import type { Episode } from "@/types/episode";
import { CATEGORIES } from "@/lib/categories";
import { isScheduledDraft } from "@/lib/format";
import AdminAudioDropzone from "@/components/AdminAudioDropzone";
import AdminCoverPicker from "@/components/AdminCoverPicker";
import AdminTextInput from "@/components/AdminTextInput";
import {
  adminFieldClass,
  adminGhostPillClass,
  adminInlineFieldClass,
  adminLabelClass,
  adminMutedClass,
  adminSolidPillClass,
} from "@/components/admin-ui";

interface ScrapedStory {
  headline: string | null;
  imageUrl: string | null;
}

export default function AdminEpisodeEditor({
  episode,
  onSaved,
  onCancel,
}: {
  episode: Episode;
  onSaved: (episode: Episode) => void;
  onCancel: () => void;
}) {
  const [scriptName, setScriptName] = useState(episode.scriptName);
  const [airDate, setAirDate] = useState(episode.airDate);
  const [sourceUrl, setSourceUrl] = useState(episode.sourceUrl ?? "");
  const [realHeadline, setRealHeadline] = useState("");
  const [headline, setHeadline] = useState(episode.headline ?? "");
  const [category, setCategory] = useState(episode.category ?? "");
  const [photoImageUrl, setPhotoImageUrl] = useState<string | null>(episode.photoUrl);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [audioInputKey, setAudioInputKey] = useState(0);

  const [isFetchingStory, setIsFetchingStory] = useState(false);
  const [isGeneratingHeadline, setIsGeneratingHeadline] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [headlineNotice, setHeadlineNotice] = useState<string | null>(null);

  async function generateHeadlineFrom(real: string) {
    setIsGeneratingHeadline(true);
    setHeadlineNotice(null);
    try {
      const response = await fetch("/api/admin/generate-headline", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ realHeadline: real }),
      });
      const body = await response.json();
      if (!response.ok) throw new Error(body.error ?? "Could not generate a headline.");
      setHeadline(body.headline ?? "");
    } catch (err) {
      setHeadline(real);
      setHeadlineNotice(
        err instanceof Error
          ? `Couldn't auto-draft a joke headline (${err.message}). Using the real headline — edit it by hand.`
          : "Couldn't auto-draft a joke headline. Using the real headline — edit it by hand.",
      );
    } finally {
      setIsGeneratingHeadline(false);
    }
  }

  async function handleFetchStory() {
    if (!sourceUrl) return;
    setIsFetchingStory(true);
    setError(null);
    try {
      const response = await fetch("/api/admin/scrape", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: sourceUrl }),
      });
      const body = await response.json();
      if (!response.ok) throw new Error(body.error ?? "Could not fetch that story.");
      const story = body as ScrapedStory;
      setRealHeadline(story.headline ?? "");
      setPhotoFile(null);
      setPhotoImageUrl(story.imageUrl ?? photoImageUrl);
      if (story.headline) {
        await generateHeadlineFrom(story.headline);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not fetch that story.");
    } finally {
      setIsFetchingStory(false);
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);
    try {
      const formData = new FormData();
      formData.set("scriptName", scriptName);
      formData.set("airDate", airDate);
      formData.set("sourceUrl", sourceUrl);
      formData.set("headline", headline);
      formData.set("category", category);
      if (photoFile) formData.set("photoFile", photoFile);
      else if (photoImageUrl) formData.set("photoImageUrl", photoImageUrl);
      if (audioFile) formData.set("audioFile", audioFile);

      const response = await fetch(`/api/admin/episodes/${episode.id}`, {
        method: "PATCH",
        body: formData,
      });
      const body = await response.json();
      if (!response.ok) throw new Error(body.error ?? "Failed to update episode.");

      onSaved(body.episode as Episode);
      setAudioFile(null);
      setAudioInputKey((key) => key + 1);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update episode.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mt-6 space-y-4 border-t border-white pt-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="edit-script-name" className={adminLabelClass}>
            Script name
          </label>
          <AdminTextInput
            id="edit-script-name"
            required
            value={scriptName}
            onChange={(event) => setScriptName(event.target.value)}
            className={adminFieldClass}
          />
        </div>
        <div>
          <label htmlFor="edit-air-date" className={adminLabelClass}>
            Air date
          </label>
          <input
            id="edit-air-date"
            required
            type="date"
            value={airDate}
            onChange={(event) => setAirDate(event.target.value)}
            className={adminFieldClass}
          />
          {isScheduledDraft(airDate) ? (
            <p className={`mt-1 ${adminMutedClass}`}>
              This date is in the future, so the story stays off the site until then.
            </p>
          ) : null}
        </div>
      </div>

      <div>
        <label htmlFor="edit-source-url" className={adminLabelClass}>
          News story URL
        </label>
        <div className="mt-1 flex flex-col gap-2 sm:flex-row">
          <AdminTextInput
            id="edit-source-url"
            type="url"
            value={sourceUrl}
            onChange={(event) => setSourceUrl(event.target.value)}
            className={adminInlineFieldClass}
          />
          <button
            type="button"
            onClick={handleFetchStory}
            disabled={!sourceUrl || isFetchingStory}
            className={adminGhostPillClass}
          >
            {isFetchingStory ? "Fetching..." : "Re-fetch headline & photo"}
          </button>
        </div>
      </div>

      <div>
        <label htmlFor="edit-headline" className={adminLabelClass}>
          Headline
        </label>
        <div className="mt-1 flex flex-col gap-2 sm:flex-row">
          <AdminTextInput
            id="edit-headline"
            value={headline}
            onChange={(event) => setHeadline(event.target.value)}
            className={adminInlineFieldClass}
          />
          <button
            type="button"
            onClick={() => realHeadline && generateHeadlineFrom(realHeadline)}
            disabled={!realHeadline || isGeneratingHeadline}
            className={adminGhostPillClass}
          >
            {isGeneratingHeadline ? "Drafting..." : "Regenerate"}
          </button>
        </div>
        {realHeadline ? <p className={`mt-1 ${adminMutedClass}`}>Real headline: {realHeadline}</p> : null}
        {headlineNotice ? <p className="mt-1 text-xs text-white/70">{headlineNotice}</p> : null}
      </div>

      <div>
        <label htmlFor="edit-category" className={adminLabelClass}>
          Category
        </label>
        <select
          id="edit-category"
          value={category}
          onChange={(event) => setCategory(event.target.value)}
          className={adminFieldClass}
        >
          <option value="">Uncategorized (only shows under &quot;Home&quot;)</option>
          {CATEGORIES.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      </div>

      <AdminCoverPicker
        id="edit-cover"
        remoteUrl={photoImageUrl}
        file={photoFile}
        onFile={setPhotoFile}
      />

      <AdminAudioDropzone
        id="edit-audio"
        label="Replace audio (optional)"
        inputKey={audioInputKey}
        file={audioFile}
        onFile={setAudioFile}
      />

      {error ? <p className="text-sm text-white">{error}</p> : null}

      <div className="flex gap-2">
        <button type="submit" disabled={isSubmitting} className={adminSolidPillClass}>
          {isSubmitting ? "Saving..." : "Save changes"}
        </button>
        <button type="button" onClick={onCancel} className={adminGhostPillClass}>
          Cancel
        </button>
      </div>
    </form>
  );
}
