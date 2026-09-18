import Image from "next/image";
import { CATEGORIES } from "@/lib/categories";

/** null selects "Home" (every episode, no filter). */
type ActiveCategory = string | null;

const AWL_NSW_ADOPT_URL = "https://www.awlnsw.com.au/adopt/";

/**
 * Logo lockup + category nav, styled after a BBC-style news masthead. Each
 * tab (plus "Home") filters the homepage's episode list down to that
 * category — see components/NewsHomeClient.tsx, which owns the selection
 * state and passes it down here.
 */
export default function SiteHeader({
  activeCategory = null,
  onSelectCategory,
}: {
  activeCategory?: ActiveCategory;
  onSelectCategory?: (category: ActiveCategory) => void;
}) {
  return (
    <header className="mx-auto w-full max-w-5xl px-2 pt-6 sm:px-4 sm:pt-8">
      <div className="flex justify-center py-1">
        <button
          type="button"
          onClick={() => onSelectCategory?.(null)}
          aria-label="The Dog Daily home"
          className="cursor-pointer"
        >
          <Image
            src="/images/logo-combined.png"
            alt="Animal Welfare League NSW — the dog daily"
            width={947}
            height={336}
            priority
            className="h-20 w-auto sm:h-28"
          />
        </button>
      </div>

      <div className="mt-5 border-t border-black" />
      <div className="flex justify-center overflow-hidden">
        <nav
          aria-label="Filter stories by category"
          className="category-nav-fit flex w-max min-w-0 flex-nowrap items-center justify-between gap-0 whitespace-nowrap py-1.5 text-[10px] font-medium tracking-tight text-black min-[400px]:text-[11px] sm:w-full sm:justify-center sm:gap-3 sm:overflow-visible sm:py-2 sm:text-[13px] sm:tracking-normal"
        >
          <button
            type="button"
            onClick={() => onSelectCategory?.(null)}
            aria-pressed={activeCategory === null}
            className={`shrink-0 rounded-full px-3 py-1 transition ${
              activeCategory === null
                ? "bg-black text-white"
                : "text-black hover:bg-neutral-100"
            }`}
          >
            Home
          </button>
          {CATEGORIES.map((category) => (
            <button
              key={category}
              type="button"
              onClick={() => onSelectCategory?.(category)}
              aria-pressed={activeCategory === category}
              className={`shrink-0 rounded-full px-3 py-1 transition ${
                activeCategory === category
                  ? "bg-black text-white"
                  : "text-black hover:bg-neutral-100"
              }`}
            >
              {category}
            </button>
          ))}
          {/* Not a filter (hence no aria-pressed) — a permanent link out to AWL
              NSW's adoption page, styled like the category toggles either side
              of it rather than as a standalone CTA pill. */}
          <a
            href={AWL_NSW_ADOPT_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="shrink-0 rounded-full px-3 py-1 text-black transition hover:bg-neutral-100"
          >
            Adopt
          </a>
        </nav>
      </div>
      <div className="border-t border-black" />
    </header>
  );
}
