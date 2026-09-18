"use client";

import { useEffect, useRef, useState } from "react";
import { adminGhostPillClass, adminLabelClass } from "@/components/admin-ui";

function isImageFile(file: File): boolean {
  if (file.type.startsWith("image/")) return true;
  return /\.(jpe?g|png|webp|gif|avif)$/i.test(file.name);
}

export default function AdminCoverPicker({
  id,
  remoteUrl,
  file,
  onFile,
}: {
  id: string;
  remoteUrl: string | null;
  file: File | null;
  onFile: (file: File) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [objectUrl, setObjectUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!file) {
      setObjectUrl(null);
      return;
    }
    const url = URL.createObjectURL(file);
    setObjectUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  const previewUrl = objectUrl ?? remoteUrl;

  return (
    <div>
      <span id={`${id}-label`} className={adminLabelClass}>
        Cover image
      </span>
      <div className="mt-1 flex items-center gap-3">
        {previewUrl ? (
          // eslint-disable-next-line @next/next/no-img-element -- arbitrary remote/local preview, not an optimized asset
          <img src={previewUrl} alt="Cover preview" className="h-20 w-28 object-cover" />
        ) : (
          <div className="flex h-20 w-28 items-center justify-center border border-white text-xs text-white/40">
            No cover
          </div>
        )}
        <button type="button" onClick={() => inputRef.current?.click()} className={adminGhostPillClass}>
          {previewUrl ? "Replace cover" : "Upload cover"}
        </button>
        <input
          ref={inputRef}
          id={id}
          type="file"
          accept="image/*"
          aria-labelledby={`${id}-label`}
          className="sr-only"
          onChange={(event) => {
            const next = event.target.files?.[0];
            if (next && isImageFile(next)) onFile(next);
            event.target.value = "";
          }}
        />
      </div>
    </div>
  );
}
