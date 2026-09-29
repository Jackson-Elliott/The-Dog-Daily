"use client";

import { useActionState } from "react";
import BrandLogo from "@/components/BrandLogo";
import { loginSite } from "@/app/gate/actions";

export default function SiteGateForm({ from }: { from?: string }) {
  const [error, formAction, isSubmitting] = useActionState(loginSite, null);

  return (
    <div className="flex w-full flex-col items-center">
      <BrandLogo />
      <form action={formAction} className="mt-6 w-full max-w-sm space-y-6">
        <input type="hidden" name="from" value={from ?? ""} />
        <div>
          <label htmlFor="site-password" className="block text-sm text-black">
            Password
          </label>
          <input
            id="site-password"
            name="password"
            type="password"
            required
            autoFocus
            className="mt-1 w-full border border-black bg-transparent px-3 py-2 text-base text-black outline-none focus:bg-black/5"
          />
        </div>

        {error ? <p className="text-sm text-black">{error}</p> : null}

        <button
          type="submit"
          disabled={isSubmitting}
          className="rounded-full bg-black px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-neutral-800 disabled:opacity-60"
        >
          {isSubmitting ? "Entering..." : "Enter"}
        </button>
      </form>
    </div>
  );
}
