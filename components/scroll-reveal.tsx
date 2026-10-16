"use client";

import { useEffect } from "react";

/**
 * Один наблюдатель на всю страницу: следит за [data-reveal] и добавляет
 * .is-visible при входе в вьюпорт.
 *
 * Помимо IntersectionObserver есть «подметание» на скролле. Оно нужно потому,
 * что при переходе по якорю или при восстановлении позиции прокрутки браузер
 * может перескочить сразу на несколько экранов: блоки, которые не успели
 * пересечь вьюпорт ни в одном кадре, никогда не получили бы колбэк и остались
 * бы невидимыми. Поэтому всё, что оказалось выше нижней границы экрана,
 * показывается принудительно.
 */
export default function ScrollReveal() {
  useEffect(() => {
    let pending = Array.from(
      document.querySelectorAll<HTMLElement>("[data-reveal]"),
    );
    if (pending.length === 0) return;

    const reduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    // Без IntersectionObserver или при отключённой анимации показываем всё сразу
    if (reduced || !("IntersectionObserver" in window)) {
      pending.forEach((el) => el.classList.add("is-visible"));
      return;
    }

    let lastRun = 0;

    const reveal = (el: HTMLElement) => {
      el.classList.add("is-visible");
    };

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          reveal(entry.target as HTMLElement);
          io.unobserve(entry.target);
        });
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.06 },
    );

    pending.forEach((el) => io.observe(el));

    /** Показать всё, что уже выше нижней границы экрана */
    const sweep = () => {
      if (pending.length === 0) return;
      const limit = window.innerHeight * 0.95;
      pending = pending.filter((el) => {
        if (el.getBoundingClientRect().top < limit) {
          reveal(el);
          io.unobserve(el);
          return false;
        }
        return true;
      });
      if (pending.length === 0) teardown();
    };

    /**
     * Троттлинг по времени, без requestAnimationFrame: в фоновой вкладке
     * кадры не отрисовываются, и раскрытие блоков не должно от этого зависеть.
     * Обход 69 элементов раз в 100 мс — это несколько микросоветов, дешевле
     * одной операции ввода пользователя.
     */
    const onScroll = () => {
      const now = Date.now();
      if (now - lastRun < 100) return;
      lastRun = now;
      sweep();
    };

    let guard = 0;

    function teardown() {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      window.removeEventListener("hashchange", onScroll);
      window.removeEventListener("pageshow", onScroll);
      if (guard) window.clearInterval(guard);
      io.disconnect();
    }

    // Первый проход: блоки, уже находящиеся в кадре, показываем без задержки
    sweep();

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    window.addEventListener("hashchange", onScroll);
    window.addEventListener("pageshow", onScroll);

    /**
     * Страховка. События прокрутки и IntersectionObserver привязаны к кадрам
     * отрисовки: если вкладка не отрисовывается (фон, восстановление сессии,
     * мгновенный переход по якорю), часть блоков может остаться скрытой.
     * Таймер не зависит от кадров и снимает этот риск полностью: он работает,
     * пока есть нераскрытые блоки, и выключает себя вместе с наблюдателем.
     */
    guard = window.setInterval(sweep, 400);

    return teardown;
  }, []);

  return null;
}
