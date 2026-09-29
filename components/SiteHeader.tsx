"use client";

import { useEffect, useId, useRef, useState } from "react";
import { ALL_VIEW, CATEGORIES, type ActiveCategory } from "@/lib/categories";
import BrandLogo from "@/components/BrandLogo";

const AWL_NSW_ADOPT_URL = "https://www.awlnsw.com.au/adopt/";

const FILTERS: { label: string; value: ActiveCategory }[] = [
  { label: "Home", value: null },
  ...CATEGORIES.map((category) => ({ label: category, value: category })),
  { label: ALL_VIEW, value: ALL_VIEW },
];

function currentLabel(activeCategory: ActiveCategory): string {
  return FILTERS.find((item) => item.value === activeCategory)?.label ?? "Home";
}

/**
 * Logo lockup + category nav, styled after a BBC-style news masthead. Each
 * category tab (plus "Home") filters the homepage. "All" is a separate
 * archive grid — see components/NewsHomeClient.tsx, which owns the selection
 * state and passes it down here.
 */
export default function SiteHeader({
  activeCategory = null,
  onSelectCategory,
}: {
  activeCategory?: ActiveCategory;
  onSelectCategory?: (category: ActiveCategory) => void;
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);
  const menuId = useId();

  useEffect(() => {
    if (!menuOpen) return;

    function handlePointerDown(event: PointerEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setMenuOpen(false);
    }

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [menuOpen]);

  function selectFilter(category: ActiveCategory) {
    onSelectCategory?.(category);
    setMenuOpen(false);
  }

  return (
    <header className="mx-auto w-full max-w-5xl px-4 pt-6 sm:pt-8">
      <div className="flex justify-center py-1">
        <button
          type="button"
          onClick={() => onSelectCategory?.(null)}
          aria-label="The Dog Daily home"
          className="cursor-pointer"
        >
          <BrandLogo />
        </button>
      </div>

      <div className="mt-5 hidden border-t border-black lg:block" />

      <div ref={menuRef} className="relative mt-5 py-2 lg:hidden">
        <button
          type="button"
          aria-expanded={menuOpen}
          aria-controls={menuId}
          aria-haspopup="listbox"
          aria-label="Choose a section"
          onClick={() => setMenuOpen((open) => !open)}
          className="flex w-full items-center justify-between rounded-full border border-black bg-white px-4 py-2 text-left text-sm font-medium text-black outline-none"
        >
          <span>{currentLabel(activeCategory)}</span>
          <svg
            viewBox="0 0 16 16"
            aria-hidden="true"
            className={`section-dropdown-chevron h-4 w-4 shrink-0 ${menuOpen ? "rotate-180" : ""}`}
          >
            <path d="M3 5.5 8 11l5-5.5" fill="none" stroke="currentColor" strokeWidth="1.75" />
          </svg>
        </button>
        <ul
          id={menuId}
          role="listbox"
          aria-label="Sections"
          aria-hidden={!menuOpen}
          className={`section-dropdown absolute inset-x-0 top-full z-20 mt-2 rounded-[1.75rem] border border-black bg-white py-2 ${
            menuOpen
              ? "visible translate-y-0 scale-100 opacity-100"
              : "invisible pointer-events-none -translate-y-1.5 scale-[0.98] opacity-0"
          }`}
        >
          {FILTERS.map((item) => {
            const selected = item.value === activeCategory;
            return (
              <li key={item.label} role="option" aria-selected={selected}>
                <button
                  type="button"
                  tabIndex={menuOpen ? 0 : -1}
                  onClick={() => selectFilter(item.value)}
                  className={`mx-2 flex w-[calc(100%-1rem)] items-center rounded-full border px-4 py-2 text-left text-sm font-medium outline-none ${
                    selected ? "border-black bg-black text-white" : "border-transparent text-black"
                  }`}
                >
                  {item.label}
                </button>
              </li>
            );
          })}
          <li>
            <a
              href={AWL_NSW_ADOPT_URL}
              target="_blank"
              rel="noopener noreferrer"
              tabIndex={menuOpen ? 0 : -1}
              className="mx-2 flex w-[calc(100%-1rem)] items-center rounded-full border border-transparent px-4 py-2 text-left text-sm font-medium text-black outline-none"
            >
              Adopt
            </a>
          </li>
        </ul>
      </div>

      <nav
        aria-label="Filter stories by category"
        className="hidden items-center justify-center gap-3 py-2 text-[13px] font-medium text-black lg:flex"
      >
        {FILTERS.map((item) => (
          <button
            key={item.label}
            type="button"
            onClick={() => onSelectCategory?.(item.value)}
            aria-pressed={activeCategory === item.value}
            className={`shrink-0 rounded-full px-3 py-1 transition ${
              activeCategory === item.value
                ? "bg-black text-white"
                : "text-black hover:bg-neutral-100"
            }`}
          >
            {item.label}
          </button>
        ))}
        <a
          href={AWL_NSW_ADOPT_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="shrink-0 rounded-full px-3 py-1 text-black transition hover:bg-neutral-100"
        >
          Adopt
        </a>
      </nav>

      <div className="hidden border-t border-black lg:block" />
    </header>
  );
}
