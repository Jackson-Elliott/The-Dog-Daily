import type { ReactNode } from "react";

/**
 * "Day After" / "Day Before" pill navigation shown under the hero story,
 * with the AudioWave visualiser passed in as `children` and rendered
 * between the two buttons — all three sit on one row (buttons pushed to the
 * outer edges, wave centered in the gap), matching the mockup. Day After
 * moves toward newer episodes, Day Before toward older ones.
 */
export default function DayNav({
  onDayAfter,
  onDayBefore,
  disableDayAfter,
  disableDayBefore,
  children,
}: {
  onDayAfter: () => void;
  onDayBefore: () => void;
  disableDayAfter: boolean;
  disableDayBefore: boolean;
  /** AudioWave, rendered centered between the two buttons. */
  children?: ReactNode;
}) {
  return (
    <div className="mt-4 flex items-center justify-between gap-3">
      <button
        type="button"
        onClick={(event) => {
          event.stopPropagation();
          onDayAfter();
        }}
        disabled={disableDayAfter}
        className="flex shrink-0 items-center gap-2 rounded-full border border-black px-4 py-2 text-sm font-medium text-black transition hover:bg-black hover:text-white disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-black"
      >
        <span aria-hidden="true">◀</span>
        Day After
      </button>
      {children}
      <button
        type="button"
        onClick={(event) => {
          event.stopPropagation();
          onDayBefore();
        }}
        disabled={disableDayBefore}
        className="flex shrink-0 items-center gap-2 rounded-full border border-black px-4 py-2 text-sm font-medium text-black transition hover:bg-black hover:text-white disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-black"
      >
        Day Before
        <span aria-hidden="true">▶</span>
      </button>
    </div>
  );
}
