"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ArrowUp, LoaderCircle, MessageSquare, RotateCcw, Send, X } from "lucide-react";
import { passDialogue, scrollToForm } from "@/lib/bridge";

type Turn = { role: "user" | "assistant"; content: string };

const OPENER: Turn = {
  role: "assistant",
  content:
    "Здравствуйте! Помогу подобрать окно, дверь или остекление. Расскажите, что нужно заменить или установить?",
};

const QUICK = [
  "Сколько стоит окно?",
  "58 или 70 мм — что выбрать?",
  "Остекление балкона",
  "Когда приедет замерщик?",
];

/** Диалог держим в памяти вкладки, чтобы не терять его при переходах по странице. */
let memoryTurns: Turn[] = [];

export default function AiConsultant() {
  const [mounted, setMounted] = useState(false);
  const [pastHero, setPastHero] = useState(false);
  const [open, setOpen] = useState(false);
  const [turns, setTurns] = useState<Turn[]>(memoryTurns.length ? memoryTurns : [OPENER]);
  const [input, setInput] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const scrollRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLTextAreaElement | null>(null);
  const panelRef = useRef<HTMLDivElement | null>(null);
  const restoreRef = useRef<HTMLElement | null>(null);

  // Кнопка появляется с небольшой задержкой, чтобы не мешать первому экрану
  useEffect(() => {
    const timer = window.setTimeout(() => setMounted(true), 1600);
    return () => window.clearTimeout(timer);
  }, []);

  /**
   * На телефоне кнопка не должна накрывать главную кнопку первого экрана,
   * поэтому показываем её только после того, как шапка уехала вверх.
   * На широком экране кнопка ничего не перекрывает — показываем сразу.
   * Опрос добавлен потому, что событие scroll может не прийти в фоновой вкладке.
   */
  useEffect(() => {
    const check = () => {
      if (window.matchMedia("(min-width: 640px)").matches) setPastHero(true);
      else setPastHero(window.scrollY > 620);
    };

    check();
    window.addEventListener("scroll", check, { passive: true });
    window.addEventListener("resize", check);
    const guard = window.setInterval(check, 500);

    return () => {
      window.removeEventListener("scroll", check);
      window.removeEventListener("resize", check);
      window.clearInterval(guard);
    };
  }, []);

  useEffect(() => {
    memoryTurns = turns;
  }, [turns]);

  useEffect(() => {
    if (!open) return;
    const node = scrollRef.current;
    if (node) node.scrollTop = node.scrollHeight;
  }, [turns, open, pending]);

  // Блокировка прокрутки страницы под панелью на телефоне + Escape
  useEffect(() => {
    if (!open) return;
    const isNarrow = window.matchMedia("(max-width: 639px)").matches;
    const previous = document.body.style.overflow;
    if (isNarrow) document.body.style.overflow = "hidden";

    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);

    /**
     * На телефоне поле намеренно не фокусируем: иначе сразу открывается
     * экранная клавиатура и панель прыгает. На десктопе это удобно.
     */
    const focusTimer = window.setTimeout(() => {
      if (window.matchMedia("(min-width: 640px)").matches) {
        inputRef.current?.focus();
      }
    }, 120);

    return () => {
      document.body.style.overflow = previous;
      window.removeEventListener("keydown", onKey);
      window.clearTimeout(focusTimer);
      restoreRef.current?.focus?.();
    };
  }, [open]);

  const send = useCallback(
    async (raw: string) => {
      const text = raw.trim().slice(0, 1200);
      if (!text || pending) return;

      const next = [...turns, { role: "user" as const, content: text }];
      setTurns(next);
      setInput("");
      setPending(true);
      setError("");
      setNotice("");

      try {
        const response = await fetch("/api/ai", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({
            messages: next.filter((t) => t.content !== OPENER.content),
          }),
        });
        const data = (await response.json().catch(() => ({}))) as {
          ok?: boolean;
          reply?: string;
          message?: string;
        };

        if (response.ok && data.ok && data.reply) {
          setTurns([...next, { role: "assistant", content: data.reply }]);
        } else {
          setError(
            data.message ??
              "Консультант не ответил. Оставьте заявку — менеджер ответит на все вопросы.",
          );
        }
      } catch {
        setError("Сеть недоступна. Оставьте заявку — менеджер свяжется с вами.");
      } finally {
        setPending(false);
      }
    },
    [pending, turns],
  );

  const handOver = useCallback(() => {
    const userTurns = turns.filter((t) => t.role === "user");
    const summary = userTurns.length
      ? `Спрашивал: ${userTurns[0].content.slice(0, 140)}${
          userTurns.length > 1
            ? ` Последнее: ${userTurns[userTurns.length - 1].content.slice(0, 140)}`
            : ""
        }`
      : "";
    passDialogue({ summary, turns: Math.max(userTurns.length * 2 - 1, 0) });
    setOpen(false);
    window.setTimeout(scrollToForm, 120);
    setNotice("Параметры разговора переданы в форму — осталось указать телефон.");
  }, [turns]);

  const reset = useCallback(() => {
    setTurns([OPENER]);
    setError("");
    setNotice("");
  }, []);

  return (
    <>
      {/* Кнопка — не мешает контенту, на телефоне поднята над нижней панелью */}
      {!open && mounted && pastHero && (
        <button
          type="button"
          ref={(node) => {
            restoreRef.current = node;
          }}
          onClick={() => setOpen(true)}
          aria-label="Открыть ИИ-консультанта"
          className={`fixed right-4 z-[55] inline-flex items-center gap-2 border border-paper/25 bg-ink px-3.5 text-paper transition-all duration-500 sm:right-6 ${
            mounted ? "translate-y-0 opacity-100" : "translate-y-3 opacity-0"
          }`}
          style={{
            bottom: "calc(env(safe-area-inset-bottom) + 4.5rem)",
            height: "3rem",
          }}
        >
          <span className="pointer-events-none absolute -right-px -top-px h-2 w-2 bg-accent-2" />
          <MessageSquare className="h-[18px] w-[18px]" aria-hidden="true" />
          <span className="hidden text-[13.5px] font-semibold sm:inline">
            Спросить консультанта
          </span>
        </button>
      )}

      {/* Панель: лист снизу на телефоне, карточка справа снизу на десктопе */}
      {open && (
        <div
          ref={panelRef}
          role="dialog"
          aria-modal="true"
          aria-label="ИИ-консультант MEGAPLAST"
          className="fixed inset-x-0 bottom-0 z-[65] flex max-h-[86dvh] flex-col border-t border-line bg-paper sm:inset-x-auto sm:right-6 sm:bottom-6 sm:max-h-[min(34rem,80dvh)] sm:w-[24rem] sm:border sm:border-line"
          style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
        >
          <header className="flex items-start justify-between gap-3 border-b border-line px-4 py-3.5">
            <div>
              <p className="text-[14.5px] font-semibold tracking-[-0.01em]">
                Консультант MEGAPLAST
              </p>
              <p className="mt-0.5 text-[12px] text-ink-3">
                Отвечает на вопросы о конструкциях
              </p>
            </div>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={reset}
                aria-label="Начать заново"
                className="-mr-1 inline-flex h-11 w-11 items-center justify-center text-ink-3 transition-colors hover:text-ink"
              >
                <RotateCcw className="h-[18px] w-[18px]" />
              </button>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Закрыть консультанта"
                className="inline-flex h-11 w-11 items-center justify-center text-ink transition-colors hover:text-accent"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </header>

          <div
            ref={scrollRef}
            className="min-h-0 flex-1 space-y-3 overflow-y-auto overscroll-contain px-4 py-4"
            aria-live="polite"
          >
            {turns.map((turn, index) => (
              <div
                key={`${index}-${turn.role}`}
                className={turn.role === "user" ? "flex justify-end" : "flex justify-start"}
              >
                <p
                  className={`max-w-[85%] whitespace-pre-line px-3.5 py-2.5 text-[14px] leading-[1.55] ${
                    turn.role === "user"
                      ? "bg-ink text-paper"
                      : "border border-line bg-paper-2 text-ink-2"
                  }`}
                >
                  {turn.content}
                </p>
              </div>
            ))}

            {pending && (
              <div className="flex items-center gap-2 text-[13px] text-ink-3">
                <LoaderCircle className="h-3.5 w-3.5 animate-spin" aria-hidden="true" />
                печатает…
              </div>
            )}

            {turns.length === 1 && !pending && (
              <div className="flex flex-wrap gap-2 pt-1">
                {QUICK.map((question) => (
                  <button
                    key={question}
                    type="button"
                    onClick={() => send(question)}
                    className="min-h-9 border border-line-2 px-3 text-[12.5px] text-ink-2 transition-colors hover:border-ink hover:text-ink"
                  >
                    {question}
                  </button>
                ))}
              </div>
            )}

            {error && (
              <div className="border border-[#b3261e]/25 bg-[#fdf1f0] p-3 text-[13px] leading-[1.5] text-[#7a1a15]">
                {error}
              </div>
            )}
          </div>

          {notice && (
            <p className="border-t border-line bg-accent-tint px-4 py-2 text-[12.5px] text-accent-ink">
              {notice}
            </p>
          )}

          <div className="border-t border-line px-4 py-3">
            <form
              onSubmit={(event) => {
                event.preventDefault();
                void send(input);
              }}
              className="flex items-end gap-2"
            >
              <label className="sr-only" htmlFor="ai-input">
                Сообщение консультанту
              </label>
              <textarea
                id="ai-input"
                ref={inputRef}
                rows={1}
                value={input}
                onChange={(event) => setInput(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" && !event.shiftKey) {
                    event.preventDefault();
                    void send(input);
                  }
                }}
                placeholder="Например: окно 1300×1400 в спальню"
                className="field max-h-28 min-h-11 flex-1 resize-none py-3 text-[16px]"
              />
              <button
                type="submit"
                disabled={pending || input.trim().length === 0}
                aria-label="Отправить сообщение"
                className="inline-flex h-11 w-11 shrink-0 items-center justify-center bg-accent text-white transition-colors hover:bg-accent-2 disabled:cursor-not-allowed disabled:bg-line-2"
              >
                {pending ? (
                  <ArrowUp className="h-4 w-4 opacity-60" aria-hidden="true" />
                ) : (
                  <Send className="h-4 w-4" aria-hidden="true" />
                )}
              </button>
            </form>

            <div className="mt-2.5 flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={handOver}
                className="inline-flex min-h-8 items-center text-[12.5px] font-semibold text-ink underline decoration-accent/40 underline-offset-4"
              >
                Передать менеджеру
              </button>
              <p className="text-right text-[11.5px] leading-tight text-ink-3">
                Расчёт — по заявке, после замера
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
