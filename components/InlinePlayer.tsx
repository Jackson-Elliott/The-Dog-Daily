import { formatTime } from "@/lib/format";

/** Pause / progress / time row that appears under a playing Design 2 or 3 story. */
export default function InlinePlayer({
  isPlaying,
  currentTime,
  duration,
  onToggle,
  className = "",
}: {
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  onToggle: () => void;
  className?: string;
}) {
  const progress = duration > 0 ? Math.min(1, currentTime / duration) : 0;
  return (
    <div className={`mt-3 flex items-center gap-3 ${className}`}>
      <button
        type="button"
        aria-label={isPlaying ? "Pause" : "Play"}
        onClick={onToggle}
        className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-black text-white"
      >
        <svg viewBox="0 0 24 24" fill="currentColor" className="h-3.5 w-3.5" aria-hidden="true">
          {isPlaying ? (
            <>
              <rect x="6" y="5" width="4" height="14" />
              <rect x="14" y="5" width="4" height="14" />
            </>
          ) : (
            <path d="M8 5v14l11-7z" />
          )}
        </svg>
      </button>
      <div className="h-px flex-1 bg-neutral-300">
        <div className="h-px bg-red-600" style={{ width: `${progress * 100}%` }} />
      </div>
      <p className="text-[11px] tabular-nums text-neutral-500">{formatTime(currentTime)}</p>
    </div>
  );
}
