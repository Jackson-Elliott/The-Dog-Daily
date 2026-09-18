"use client";

import { useState } from "react";
import type { Episode } from "@/types/episode";
import AdminUploadForm from "@/components/AdminUploadForm";
import AdminEpisodeList from "@/components/AdminEpisodeList";
import { sortEpisodesByAirDate } from "@/lib/format";

export default function AdminDashboard({ initialEpisodes }: { initialEpisodes: Episode[] }) {
  const [episodes, setEpisodes] = useState<Episode[]>(() => sortEpisodesByAirDate(initialEpisodes));

  return (
    <div className="flex flex-col gap-10 pb-12">
      <AdminUploadForm
        onCreated={(episode) =>
          setEpisodes((prev) => sortEpisodesByAirDate([episode, ...prev.filter((item) => item.id !== episode.id)]))
        }
      />

      <div className="border-t border-white" />

      <AdminEpisodeList
        episodes={episodes}
        onUpdated={(episode) =>
          setEpisodes((prev) => sortEpisodesByAirDate(prev.map((item) => (item.id === episode.id ? episode : item))))
        }
        onDeleted={(id) => setEpisodes((prev) => prev.filter((episode) => episode.id !== id))}
      />
    </div>
  );
}
