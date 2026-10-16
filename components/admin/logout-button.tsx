"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LogoutButton() {
  const router = useRouter();
  const [pending, setPending] = useState(false);

  async function logout() {
    if (pending) return;
    setPending(true);
    try {
      await fetch("/api/admin/login", { method: "DELETE" });
    } finally {
      router.refresh();
      setPending(false);
    }
  }

  return (
    <button
      type="button"
      onClick={logout}
      disabled={pending}
      className="inline-flex min-h-11 items-center text-[13px] font-medium text-ink-3 transition-colors hover:text-ink disabled:opacity-50"
    >
      {pending ? "Выходим…" : "Выйти"}
    </button>
  );
}
