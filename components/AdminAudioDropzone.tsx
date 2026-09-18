"use client";

import { useRef, useState, type DragEvent } from "react";
import { adminLabelClass, adminMutedClass } from "@/components/admin-ui";

function isAudioFile(file: File): boolean {
  if (file.type.startsWith("audio/")) return true;
  return /\.(mp3|wav|m4a|aac|ogg|flac)$/i.test(file.name);
}

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function AdminAudioDropzone({
  id,
  label,
  required,
  inputKey,
  file,
  onFile,
}: {
  id: string;
  label: string;
  required?: boolean;
  inputKey: number;
  file: File | null;
  onFile: (file: File | null) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const dragDepth = useRef(0);
  const [isDragging, setIsDragging] = useState(false);

  function assignFile(next: File | null) {
    onFile(next);
    const input = inputRef.current;
    if (!input) return;
    if (!next) {
      input.value = "";
      return;
    }
    const data = new DataTransfer();
    data.items.add(next);
    input.files = data.files;
  }

  function takeFirstAudio(files: FileList | null) {
    if (!files?.length) return;
    const audio = Array.from(files).find(isAudioFile);
    if (audio) assignFile(audio);
  }

  function handleDragEnter(event: DragEvent<HTMLLabelElement>) {
    event.preventDefault();
    dragDepth.current += 1;
    setIsDragging(true);
  }

  function handleDragOver(event: DragEvent<HTMLLabelElement>) {
    event.preventDefault();
    event.dataTransfer.dropEffect = "copy";
  }

  function handleDragLeave(event: DragEvent<HTMLLabelElement>) {
    event.preventDefault();
    dragDepth.current -= 1;
    if (dragDepth.current <= 0) {
      dragDepth.current = 0;
      setIsDragging(false);
    }
  }

  function handleDrop(event: DragEvent<HTMLLabelElement>) {
    event.preventDefault();
    dragDepth.current = 0;
    setIsDragging(false);
    takeFirstAudio(event.dataTransfer.files);
  }

  return (
    <div>
      <span className={adminLabelClass}>{label}</span>
      <label
        htmlFor={id}
        onDragEnter={handleDragEnter}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`mt-1 flex min-h-24 cursor-pointer flex-col items-center justify-center border border-dashed px-4 py-5 text-center text-sm text-white transition ${
          isDragging ? "border-white bg-white/10" : "border-white hover:bg-white/5"
        }`}
      >
        <input
          ref={inputRef}
          id={id}
          key={inputKey}
          required={required}
          type="file"
          accept="audio/*"
          onChange={(event) => takeFirstAudio(event.target.files)}
          className="sr-only"
        />
        {file ? (
          <>
            <span className="font-medium">{file.name}</span>
            <span className={`mt-1 ${adminMutedClass}`}>
              {formatSize(file.size)} · drop a different file to replace
            </span>
          </>
        ) : (
          <>
            <span>Drop mp3 or wav here</span>
            <span className={`mt-1 ${adminMutedClass}`}>or click to choose a file</span>
          </>
        )}
      </label>
    </div>
  );
}
