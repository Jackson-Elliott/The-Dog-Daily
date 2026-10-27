"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { DESIGN_IDS, type DesignId } from "@/lib/design";
import { adminGhostPillClass, adminSolidPillClass } from "@/components/admin-ui";

export default function AdminDesignPicker({ activeDesign }: { activeDesign: DesignId }) {
  const router = useRouter();
  const [selected, setSelected] = useState<DesignId>(activeDesign);
  const [pending, setPending] = useState(false);

  async function choose(design: DesignId) {
    if (design === selected || pending) return;
    setPending(true);
    try {
      const response = await fetch("/api/admin/design", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ design }),
      });
      const body = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(typeof body.error === "string" ? body.error : "Could not switch design.");
      }
      setSelected(design);
      router.refresh();
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="flex flex-wrap gap-3">
      {DESIGN_IDS.map((design) => {
        const isActive = selected === design;
        return (
          <button
            key={design}
            type="button"
            aria-pressed={isActive}
            disabled={pending}
            onClick={() => choose(design)}
            className={isActive ? adminSolidPillClass : adminGhostPillClass}
          >
            Design {design}
          </button>
        );
      })}
    </div>
  );
}
