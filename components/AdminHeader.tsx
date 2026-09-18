"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";

/**
 * Dark-mode twin of SiteHeader: same logo lockup, hairline rules, and pill
 * nav — inverted to white-on-black. Home goes back to the public site;
 * Admin is the current section; Log out only shows when signed in.
 */
export default function AdminHeader({ loggedIn }: { loggedIn: boolean }) {
  const router = useRouter();

  async function handleLogout() {
    await fetch("/api/admin/logout", { method: "POST" });
    router.refresh();
  }

  return (
    <header className="mx-auto w-full max-w-5xl px-4 pt-6 sm:pt-8">
      <div className="flex justify-center py-1">
        <Link href="/" aria-label="The Dog Daily home" className="cursor-pointer">
          <Image
            src="/images/logo-combined.png"
            alt="Animal Welfare League NSW — the dog daily"
            width={947}
            height={336}
            priority
            className="h-20 w-auto invert sm:h-28"
          />
        </Link>
      </div>

      <div className="mt-5 border-t border-white" />
      <nav
        aria-label="Admin"
        className="flex justify-center gap-3 px-4 py-2 text-[13px] font-medium text-white sm:px-0"
      >
        <Link href="/" className="rounded-full px-3 py-1 text-white transition hover:bg-white/10">
          Home
        </Link>
        <span className="rounded-full bg-white px-3 py-1 text-black">Admin</span>
        {loggedIn ? (
          <button
            type="button"
            onClick={handleLogout}
            className="rounded-full px-3 py-1 text-white transition hover:bg-white/10"
          >
            Log out
          </button>
        ) : null}
      </nav>
      <div className="border-t border-white" />
    </header>
  );
}
