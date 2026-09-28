"use client";

import { useRef, useState, type DragEvent } from "react";
import { adminLabelClass, adminMutedClass } from "@/components/admin-ui";
import { convertWavToMp3IfNeeded } from "@/lib/wav-to-mp3";

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
  const convertGeneration = useRef(0);
  const [isDragging, setIsDragging] = useState(false);
  const [isConverting, setIsConverting] = useState(false);
  const [convertedFromWav, setConvertedFromWav] = useState(false);
  const [convertError, setConvertError] = useState<string | null>(null);

  function assignFile(next: File | null, fromWav = false) {
    onFile(next);
    setConvertedFromWav(Boolean(next) && fromWav);
    const input = inputRef.current;
    if (!input) return;
    if (!next) {
      input.value = "";
      return;
    }
    try {
      const data = new DataTransfer();
      data.items.add(next);
      input.files = data.files;
    } catch {
      // The native input is only a fallback; React state holds the file for upload.
    }
  }

  async function takeFirstAudio(files: FileList | null) {
    if (!files?.length) return;
    const audio = Array.from(files).find(isAudioFile);
    if (!audio) return;

    const generation = ++convertGeneration.current;
    setConvertError(null);
    assignFile(null);
    setIsConverting(true);
    try {
      const next = await convertWavToMp3IfNeeded(audio);
      if (generation !== convertGeneration.current) return;
      assignFile(next, next !== audio);
    } catch (error) {
      if (generation !== convertGeneration.current) return;
      setConvertError(error instanceof Error ? error.message : "Couldn't convert that WAV to MP3.");
      assignFile(null);
    } finally {
      if (generation === convertGeneration.current) setIsConverting(false);
    }
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
    void takeFirstAudio(event.dataTransfer.files);
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
          required={required && !file}
          type="file"
          accept="audio/*,.wav,.mp3"
          onChange={(event) => void takeFirstAudio(event.target.files)}
          className="sr-only"
        />
        {isConverting ? (
          <span>Converting WAV to MP3...</span>
        ) : file ? (
          <>
            <span className="font-medium">{file.name}</span>
            <span className={`mt-1 ${adminMutedClass}`}>
              {formatSize(file.size)}
              {convertedFromWav ? " · converted from WAV" : ""} · drop a different file to replace
            </span>
          </>
        ) : (
          <>
            <span>Drop mp3 or wav here</span>
            <span className={`mt-1 ${adminMutedClass}`}>WAV is converted to MP3 automatically</span>
          </>
        )}
      </label>
      {convertError ? <p className="mt-1 text-sm text-white">{convertError}</p> : null}
    </div>
  );
}
