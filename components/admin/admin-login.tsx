"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { LoaderCircle } from "lucide-react";

export default function AdminLogin() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (pending) return;
    setPending(true);
    setError("");

    try {
      const response = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ password }),
      });
      const data = (await response.json().catch(() => ({}))) as { message?: string };

      if (response.ok) {
        router.refresh();
        return;
      }
      setError(data.message ?? "Не удалось войти.");
    } catch {
      setError("Сеть недоступна.");
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="mx-auto max-w-md px-5 py-20">
      <p className="eyebrow">Панель менеджера</p>
      <h1 className="mt-3 text-[26px] font-semibold tracking-[-0.02em]">
        Заявки MEGAPLAST
      </h1>
      <p className="mt-3 text-[14.5px] leading-[1.6] text-ink-2">
        Раздел закрыт: здесь видны контакты клиентов и история обращений.
      </p>

      <form onSubmit={submit} className="mt-8 border border-line bg-paper p-5">
        <label className="field-label" htmlFor="admin-password">
          Пароль
        </label>
        <input
          id="admin-password"
          type="password"
          autoComplete="current-password"
          className="field"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? "admin-error" : undefined}
        />
        {error && (
          <p id="admin-error" role="alert" className="mt-2 text-[12.5px] font-medium text-[#b3261e]">
            {error}
          </p>
        )}
        <button type="submit" className="btn btn-primary mt-5 w-full" disabled={pending}>
          {pending ? (
            <>
              <LoaderCircle className="h-4 w-4 animate-spin" aria-hidden="true" />
              Проверяем…
            </>
          ) : (
            "Войти"
          )}
        </button>
      </form>

      <a href="/" className="mt-8 inline-flex min-h-11 items-center text-[13.5px] text-ink-3">
        ← Вернуться на сайт
      </a>
    </div>
  );
}
