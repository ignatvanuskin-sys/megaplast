"use client";

import { useEffect } from "react";
import { MessageCircle, Phone, RotateCcw } from "lucide-react";
import { primaryPhone, waLink } from "@/data/site";

/**
 * Страница ошибки: показывает понятный текст вместо технического экрана,
 * даёт повторить попытку и не оставляет пользователя без контактов.
 */
export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Ошибку фиксируем в консоли — этого достаточно для диагностики
    console.error("[ui] ошибка рендера:", error);
  }, [error]);

  return (
    <main className="shell flex min-h-dvh items-center py-20">
      <div className="max-w-[42rem]">
        <p className="eyebrow">Что-то пошло не так</p>
        <h1 className="mt-4 text-[clamp(1.75rem,4.4vw,2.5rem)] font-semibold leading-[1.05] tracking-[-0.03em]">
          Не удалось показать страницу
        </h1>
        <p className="mt-5 text-[16px] leading-[1.65] text-ink-2">
          Это временная неполадка на нашей стороне, данные никуда не пропали.
          Попробуйте обновить — или свяжитесь с нами напрямую, мы поможем.
        </p>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <button type="button" onClick={reset} className="btn btn-primary">
            <RotateCcw className="h-4 w-4" aria-hidden="true" />
            Попробовать снова
          </button>
          <a href="/" className="btn btn-outline">
            На главную
          </a>
        </div>

        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <a href={`tel:${primaryPhone.tel}`} className="btn btn-outline">
            <Phone className="h-4 w-4 text-accent" aria-hidden="true" />
            {primaryPhone.label}
          </a>
          <a
            href={waLink(0, "Здравствуйте! На сайте произошла ошибка, помогите, пожалуйста.")}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-outline"
          >
            <MessageCircle className="h-4 w-4 text-accent" aria-hidden="true" />
            WhatsApp
          </a>
        </div>
      </div>
    </main>
  );
}
