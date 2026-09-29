"use client";

import { useEffect, useId, useLayoutEffect, useRef, useState } from "react";
import { ALL_VIEW, CATEGORIES, type ActiveCategory } from "@/lib/categories";
import BrandLogo from "@/components/BrandLogo";

const AWL_NSW_ADOPT_URL = "https://www.awlnsw.com.au/adopt/";
const ITEM_STAGGER_MS = 30;
const PILL_MS = 280;
const CLOSE_MS = 420;

const FILTERS: { label: string; value: ActiveCategory }[] = [
  { label: "Home", value: null },
  ...CATEGORIES.map((category) => ({ label: category, value: category })),
  { label: ALL_VIEW, value: ALL_VIEW },
];

function currentLabel(activeCategory: ActiveCategory): string {
  return FILTERS.find((item) => item.value === activeCategory)?.label ?? "Home";
}

/** Layout position inside `ancestor`, ignoring CSS transforms on the way up. */
function offsetInAncestor(element: HTMLElement, ancestor: HTMLElement) {
  let top = 0;
  let left = 0;
  let node: HTMLElement | null = element;
  while (node && node !== ancestor) {
    top += node.offsetTop;
    left += node.offsetLeft;
    node = node.offsetParent instanceof HTMLElement ? node.offsetParent : null;
  }
  return { top, left };
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
  const [pill, setPill] = useState<{ top: number; left: number; width: number; height: number } | null>(
    null,
  );
  const [pillAnimated, setPillAnimated] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);
  const listRef = useRef<HTMLUListElement | null>(null);
  const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const overflowTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const menuId = useId();

  useEffect(() => {
    const desktop = window.matchMedia("(min-width: 1024px)");
    const closeOnDesktop = () => {
      if (desktop.matches) setMenuOpen(false);
    };
    desktop.addEventListener("change", closeOnDesktop);
    return () => desktop.removeEventListener("change", closeOnDesktop);
  }, []);

  useEffect(() => {
    if (!menuOpen) return;

    function handlePointerDown(event: PointerEvent) {
      const target = event.target as HTMLElement | null;
      if (!target || menuRef.current?.contains(target)) return;
      if (closeTimerRef.current) clearTimeout(closeTimerRef.current);
      setMenuOpen(false);
      // iOS/Android fire the click on whatever is under the finger after
      // the menu closes — hero, story cards, Day After. Swallow that unless
      // the tap was the masthead logo (outside this menu, still a control).
      if (target.closest("[data-masthead-home]")) return;
      const swallowClick = (clickEvent: Event) => {
        clickEvent.preventDefault();
        clickEvent.stopPropagation();
        document.removeEventListener("click", swallowClick, true);
      };
      document.addEventListener("click", swallowClick, true);
      window.setTimeout(() => document.removeEventListener("click", swallowClick, true), 500);
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setMenuOpen(false);
    }

    if (overflowTimerRef.current) {
      clearTimeout(overflowTimerRef.current);
      overflowTimerRef.current = null;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      overflowTimerRef.current = setTimeout(() => {
        document.body.style.overflow = previousOverflow;
        overflowTimerRef.current = null;
      }, CLOSE_MS);
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [menuOpen]);

  useLayoutEffect(() => {
    const maybeList = listRef.current;
    if (!maybeList) return;
    const menuList: HTMLUListElement = maybeList;

    function measurePill(target: HTMLUListElement) {
      const selected = target.querySelector<HTMLElement>("[data-section-option][aria-selected='true'] button");
      if (!selected) return;
      const { top, left } = offsetInAncestor(selected, target);
      setPill({
        top,
        left,
        width: selected.offsetWidth,
        height: selected.offsetHeight,
      });
    }

    if (!menuOpen) {
      measurePill(menuList);
      const clear = setTimeout(() => {
        setPill(null);
        setPillAnimated(false);
        menuList.style.maxHeight = "";
      }, CLOSE_MS);
      return () => clearTimeout(clear);
    }

    function fitList() {
      const top = menuList.getBoundingClientRect().top;
      const viewport = window.visualViewport?.height ?? window.innerHeight;
      const room = Math.max(128, viewport - top - 12);
      menuList.style.maxHeight = `${room}px`;
      measurePill(menuList);
    }

    function onMenuScroll() {
      measurePill(menuList);
    }

    fitList();
    let cancelled = false;
    const raf = window.requestAnimationFrame(() => {
      if (cancelled) return;
      measurePill(menuList);
      window.requestAnimationFrame(() => {
        if (!cancelled) setPillAnimated(true);
      });
    });
    menuList.addEventListener("scroll", onMenuScroll, { passive: true });
    window.addEventListener("resize", fitList);
    window.visualViewport?.addEventListener("resize", fitList);
    return () => {
      cancelled = true;
      window.cancelAnimationFrame(raf);
      menuList.removeEventListener("scroll", onMenuScroll);
      window.removeEventListener("resize", fitList);
      window.visualViewport?.removeEventListener("resize", fitList);
    };
  }, [menuOpen, activeCategory]);

  useEffect(() => {
    return () => {
      if (closeTimerRef.current) clearTimeout(closeTimerRef.current);
    };
  }, []);

  function selectFilter(category: ActiveCategory) {
    onSelectCategory?.(category);
    if (closeTimerRef.current) clearTimeout(closeTimerRef.current);
    if (category === activeCategory || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setMenuOpen(false);
      return;
    }
    closeTimerRef.current = setTimeout(() => setMenuOpen(false), PILL_MS);
  }

  return (
    <header className="mx-auto w-full max-w-5xl px-4 pt-6 sm:pt-8">
      <div className="flex justify-center py-1">
        <button
          type="button"
          data-masthead-home=""
          onClick={() => {
            if (closeTimerRef.current) clearTimeout(closeTimerRef.current);
            setMenuOpen(false);
            onSelectCategory?.(null);
          }}
          aria-label="The Dog Daily home"
          className="flex max-w-full cursor-pointer items-center"
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
          onClick={() => {
            if (closeTimerRef.current) clearTimeout(closeTimerRef.current);
            setMenuOpen((open) => !open);
          }}
          className="flex w-full touch-manipulation items-center justify-between rounded-full border border-black bg-white px-4 py-2 text-left text-sm font-medium text-black outline-none"
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
          ref={listRef}
          id={menuId}
          role="listbox"
          aria-label="Sections"
          aria-hidden={!menuOpen}
          inert={!menuOpen}
          className={`section-dropdown absolute inset-x-0 top-full z-20 mt-2 flex max-h-[70dvh] flex-col gap-1.5 overflow-y-auto overscroll-contain rounded-[19px] border border-black bg-white py-2.5 ${
            menuOpen
              ? "section-dropdown-open visible opacity-100"
              : "invisible pointer-events-none opacity-0"
          }`}
        >
          {FILTERS.map((item, index) => {
            const selected = item.value === activeCategory;
            return (
              <li
                key={item.label}
                role="option"
                aria-selected={selected}
                data-section-option=""
                className="section-dropdown-item"
                style={menuOpen ? { animationDelay: `${index * ITEM_STAGGER_MS}ms` } : undefined}
              >
                <button
                  type="button"
                  tabIndex={menuOpen ? 0 : -1}
                  onClick={() => selectFilter(item.value)}
                  className="relative mx-2 flex w-[calc(100%-1rem)] touch-manipulation items-center rounded-full border border-transparent bg-transparent px-4 py-2 text-left text-sm font-medium text-black outline-none"
                >
                  {item.label}
                </button>
              </li>
            );
          })}
          <li
            className="section-dropdown-item"
            style={menuOpen ? { animationDelay: `${FILTERS.length * ITEM_STAGGER_MS}ms` } : undefined}
          >
            <a
              href={AWL_NSW_ADOPT_URL}
              target="_blank"
              rel="noopener noreferrer"
              tabIndex={menuOpen ? 0 : -1}
              className="relative mx-2 flex w-[calc(100%-1rem)] touch-manipulation items-center rounded-full border border-transparent px-4 py-2 text-left text-sm font-medium text-black outline-none"
            >
              Adopt
            </a>
          </li>
          {pill ? (
            <li
              aria-hidden="true"
              className={`section-dropdown-pill ${pillAnimated ? "section-dropdown-pill-move" : ""}`}
              style={{
                top: pill.top,
                left: pill.left,
                width: pill.width,
                height: pill.height,
              }}
            />
          ) : null}
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
