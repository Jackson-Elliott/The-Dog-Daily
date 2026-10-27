"use client";

import { useState } from "react";
import type { Episode } from "@/types/episode";
import type { DesignId } from "@/lib/design";
import type { Imagery } from "@/lib/imagery";
import AdminDesignPicker from "@/components/AdminDesignPicker";
import AdminImageryPicker from "@/components/AdminImageryPicker";
import AdminUploadForm from "@/components/AdminUploadForm";
import AdminEpisodeList from "@/components/AdminEpisodeList";
import { sortEpisodesByAirDate } from "@/lib/format";

export default function AdminDashboard({
  initialEpisodes,
  activeDesign,
  activeImagery,
}: {
  initialEpisodes: Episode[];
  activeDesign: DesignId;
  activeImagery: Imagery;
}) {
  const [episodes, setEpisodes] = useState<Episode[]>(() => sortEpisodesByAirDate(initialEpisodes));

  return (
    <div className="flex flex-col gap-10 pb-12">
      <div className="flex flex-col gap-3">
        <AdminDesignPicker activeDesign={activeDesign} />
        <AdminImageryPicker activeImagery={activeImagery} />
      </div>

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
