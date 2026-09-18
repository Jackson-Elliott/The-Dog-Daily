"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { adminFieldClass, adminLabelClass, adminSolidPillClass } from "@/components/admin-ui";

export default function AdminLoginForm() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);
    try {
      const response = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      if (!response.ok) {
        const body = await response.json().catch(() => ({}));
        throw new Error(body.error ?? "Incorrect password.");
      }
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mx-auto w-full max-w-md space-y-6">
      <div>
        <h1 className="text-4xl font-bold text-white">Sign in</h1>
        <p className="mt-2 text-sm text-white/60">Enter the admin password to upload and edit episodes.</p>
      </div>

      <div>
        <label htmlFor="password" className={adminLabelClass}>
          Password
        </label>
        <input
          id="password"
          type="password"
          required
          autoFocus
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          className={adminFieldClass}
        />
      </div>

      {error ? <p className="text-sm text-white">{error}</p> : null}

      <button type="submit" disabled={isSubmitting} className={adminSolidPillClass}>
        {isSubmitting ? "Signing in..." : "Sign in"}
      </button>
    </form>
  );
}
