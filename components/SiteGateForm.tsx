"use client";

import Image from "next/image";
import { useState, type FormEvent } from "react";

function safeNextPath(value: string | undefined): string {
  if (!value || !value.startsWith("/") || value.startsWith("//") || value.startsWith("/gate")) {
    return "/";
  }
  return value;
}

export default function SiteGateForm({ from }: { from?: string }) {
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);
    try {
      const response = await fetch("/api/site/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      if (!response.ok) {
        const body = await response.json().catch(() => ({}));
        throw new Error(body.error ?? "Incorrect password.");
      }
      window.location.assign(safeNextPath(from));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
      setIsSubmitting(false);
    }
  }

  return (
    <form method="post" action="/gate" onSubmit={handleSubmit} className="w-full max-w-sm space-y-6">
      <div className="flex justify-center">
        <Image
          src="/images/logo-combined.png"
          alt="Animal Welfare League NSW — the dog daily"
          width={947}
          height={336}
          priority
          className="h-20 w-auto sm:h-28"
        />
      </div>

      <div>
        <label htmlFor="site-password" className="block text-sm text-black">
          Password
        </label>
        <input
          id="site-password"
          type="password"
          required
          autoFocus
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          className="mt-1 w-full border border-black bg-transparent px-3 py-2 text-sm text-black outline-none focus:bg-black/5"
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
  );
}
