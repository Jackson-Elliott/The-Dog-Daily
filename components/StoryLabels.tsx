import type { Episode } from "@/types/episode";

/** Red sub-topic (or topic) label above a headline. Used by Designs 2 and 3. */
export function StoryKicker({ episode, className = "" }: { episode: Episode; className?: string }) {
  const label = episode.subcategory ?? episode.category;
  if (!label) return null;
  return (
    <p className={`text-[11px] font-bold uppercase tracking-[0.14em] text-red-600 ${className}`}>{label}</p>
  );
}

/** Red "Listen ›" link text, which reads "Playing" while the spot plays. */
export function ListenLabel({ isPlaying, className = "" }: { isPlaying: boolean; className?: string }) {
  return (
    <p className={`text-xs font-bold text-red-600 decoration-red-600 underline-offset-2 group-hover:underline ${className}`}>
      {isPlaying ? "Playing" : "Listen ›"}
    </p>
  );
}
