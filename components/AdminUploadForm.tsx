"use client";

import { useState, type FormEvent } from "react";
import type { Episode } from "@/types/episode";
import { CATEGORIES } from "@/lib/categories";
import { formatEpisodeDate, isScheduledDraft, todayInSydney } from "@/lib/format";
import AdminAudioDropzone from "@/components/AdminAudioDropzone";
import AdminCoverPicker from "@/components/AdminCoverPicker";
import AdminPublishSwitch from "@/components/AdminPublishSwitch";
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

export default function AdminUploadForm({
  onCreated,
}: {
  onCreated: (episode: Episode) => void;
}) {
  const [scriptName, setScriptName] = useState("");
  const [airDate, setAirDate] = useState(todayInSydney());
  const [sourceUrl, setSourceUrl] = useState("");
  const [realHeadline, setRealHeadline] = useState("");
  const [headline, setHeadline] = useState("");
  const [category, setCategory] = useState("");
  const [published, setPublished] = useState(true);
  const [photoImageUrl, setPhotoImageUrl] = useState<string | null>(null);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [audioInputKey, setAudioInputKey] = useState(0);

  const [isFetchingStory, setIsFetchingStory] = useState(false);
  const [isGeneratingHeadline, setIsGeneratingHeadline] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [headlineNotice, setHeadlineNotice] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

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
      // Non-fatal: fall back to the real headline so the admin still has
      // something to work with, and surface why the draft wasn't auto-written.
      setHeadline(real);
      setHeadlineNotice(
        err instanceof Error
          ? `Couldn't auto-draft a joke headline (${err.message}). Using the real headline — edit it by hand.`
          : "Couldn't auto-draft a joke headline. Using the real headline — edit it by hand."
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
      setPhotoImageUrl(story.imageUrl ?? null);
      if (story.headline) {
        await generateHeadlineFrom(story.headline);
      } else {
        setHeadline("");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not fetch that story.");
    } finally {
      setIsFetchingStory(false);
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!audioFile) {
      setError("Please choose an audio file.");
      return;
    }

    setError(null);
    setSuccessMessage(null);
    setIsSubmitting(true);
    try {
      const formData = new FormData();
      formData.set("scriptName", scriptName);
      formData.set("airDate", airDate);
      formData.set("sourceUrl", sourceUrl);
      formData.set("headline", headline);
      formData.set("category", category);
      formData.set("published", published ? "true" : "false");
      if (photoFile) formData.set("photoFile", photoFile);
      else if (photoImageUrl) formData.set("photoImageUrl", photoImageUrl);
      formData.set("audioFile", audioFile);

      const response = await fetch("/api/admin/episodes", {
        method: "POST",
        body: formData,
      });
      const body = await response.json();
      if (!response.ok) throw new Error(body.error ?? "Failed to save episode.");

      onCreated(body.episode as Episode);
      setSuccessMessage(
        !published
          ? "Saved as a draft. It stays off the public site until you publish it."
          : isScheduledDraft(airDate)
            ? `Saved. It goes live on ${formatEpisodeDate(airDate)}.`
            : "Episode saved.",
      );

      setScriptName("");
      setAirDate(todayInSydney());
      setSourceUrl("");
      setRealHeadline("");
      setHeadline("");
      setHeadlineNotice(null);
      setCategory("");
      setPublished(true);
      setPhotoImageUrl(null);
      setPhotoFile(null);
      setAudioFile(null);
      setAudioInputKey((key) => key + 1);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save episode.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <h2 className="text-3xl font-bold text-white">Upload today&apos;s episode</h2>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="upload-script-name" className={adminLabelClass}>
            Script name
          </label>
          <AdminTextInput
            id="upload-script-name"
            required
            value={scriptName}
            onChange={(event) => setScriptName(event.target.value)}
            className={adminFieldClass}
            placeholder="e.g. Episode 47: Bad Landlord, Good Boy"
          />
        </div>
        <div>
          <label htmlFor="upload-air-date" className={adminLabelClass}>
            Air date
          </label>
          <input
            id="upload-air-date"
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
        <label htmlFor="upload-source-url" className={adminLabelClass}>
          News story URL
        </label>
        <div className="mt-1 flex flex-col gap-2 sm:flex-row">
          <AdminTextInput
            id="upload-source-url"
            type="url"
            value={sourceUrl}
            onChange={(event) => setSourceUrl(event.target.value)}
            className={adminInlineFieldClass}
            placeholder="https://example.com/news-story"
          />
          <button
            type="button"
            onClick={handleFetchStory}
            disabled={!sourceUrl || isFetchingStory}
            className={adminGhostPillClass}
          >
            {isFetchingStory ? "Fetching..." : "Fetch headline & photo"}
          </button>
        </div>
      </div>

      <div>
        <label htmlFor="upload-headline" className={adminLabelClass}>
          Headline (editable — this is what shows on the site)
        </label>
        <div className="mt-1 flex flex-col gap-2 sm:flex-row">
          <AdminTextInput
            id="upload-headline"
            value={headline}
            onChange={(event) => setHeadline(event.target.value)}
            className={adminInlineFieldClass}
            placeholder="Headline shown on the site"
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
        <label htmlFor="upload-category" className={adminLabelClass}>
          Category (controls which header nav tab this shows under)
        </label>
        <select
          id="upload-category"
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

      <AdminPublishSwitch id="upload-published" published={published} onChange={setPublished} />
      {published && isScheduledDraft(airDate) ? (
        <p className={adminMutedClass}>
          Published, but the air date is in the future, so it still stays off the site until then.
        </p>
      ) : null}
      {!published ? (
        <p className={adminMutedClass}>Drafts stay off the public site until you switch this to Published.</p>
      ) : null}

      <AdminCoverPicker
        id="upload-cover"
        remoteUrl={photoImageUrl}
        file={photoFile}
        onFile={setPhotoFile}
      />

      <AdminAudioDropzone
        id="upload-audio"
        label="Audio file (mp3/wav)"
        required
        inputKey={audioInputKey}
        file={audioFile}
        onFile={setAudioFile}
      />

      {error ? <p className="text-sm text-white">{error}</p> : null}
      {successMessage ? <p className="text-sm text-white/70">{successMessage}</p> : null}

      <button type="submit" disabled={isSubmitting} className={adminSolidPillClass}>
        {isSubmitting ? "Saving..." : "Save episode"}
      </button>
    </form>
  );
}
