"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { IMAGERY_IDS, IMAGERY_LABELS, type Imagery } from "@/lib/imagery";
import { adminGhostPillClass, adminSolidPillClass } from "@/components/admin-ui";

export default function AdminImageryPicker({ activeImagery }: { activeImagery: Imagery }) {
  const router = useRouter();
  const [selected, setSelected] = useState<Imagery>(activeImagery);
  const [pending, setPending] = useState(false);

  async function choose(imagery: Imagery) {
    if (imagery === selected || pending) return;
    setPending(true);
    try {
      const response = await fetch("/api/admin/imagery", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imagery }),
      });
      const body = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(typeof body.error === "string" ? body.error : "Could not switch imagery.");
      }
      setSelected(imagery);
      router.refresh();
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="flex flex-wrap gap-3">
      {IMAGERY_IDS.map((imagery) => {
        const isActive = selected === imagery;
        return (
          <button
            key={imagery}
            type="button"
            aria-pressed={isActive}
            disabled={pending}
            onClick={() => choose(imagery)}
            className={isActive ? adminSolidPillClass : adminGhostPillClass}
          >
            {IMAGERY_LABELS[imagery]}
          </button>
        );
      })}
    </div>
  );
}
