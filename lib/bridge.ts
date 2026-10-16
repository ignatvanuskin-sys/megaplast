/** Мост между блоками интерфейса: каталог → калькулятор, консультант → форма.
 *  Только для клиентских компонентов. */

export const PRODUCT_EVENT = "mp:select-product";
export const CONSULT_EVENT = "mp:consult-summary";

export function requestProduct(product: string): void {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent(PRODUCT_EVENT, { detail: product }));
}

export function passDialogue(payload: { summary: string; turns: number }): void {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent(CONSULT_EVENT, { detail: payload }));
}

export function prefersReducedMotion(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export function scrollToForm(): void {
  if (typeof document === "undefined") return;
  const target = document.getElementById("raschet");
  if (!target) return;

  try {
    target.scrollIntoView({
      behavior: prefersReducedMotion() ? "auto" : "smooth",
      block: "start",
    });
  } catch {
    // Очень старые движки — сработает страховка ниже
  }

  /**
   * Страховка. Плавная прокрутка и переход по якорю зависят от кадров
   * отрисовки: если вкладка в этот момент не отрисовывается (например, только
   * что закрылась панель), переход может не состояться. Поэтому через
   * мгновение проверяем результат и при необходимости прокручиваем напрямую —
   * установка scrollTop применяется синхронно и срабатывает всегда.
   */
  window.setTimeout(() => {
    const top = target.getBoundingClientRect().top;
    if (Math.abs(top - 96) > 140) {
      const scrolled = window.scrollY || document.scrollingElement?.scrollTop || 0;
      window.scrollTo({ top: Math.max(top + scrolled - 96, 0), behavior: "auto" });
    }
  }, 420);
}
