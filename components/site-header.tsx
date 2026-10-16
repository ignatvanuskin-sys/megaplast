"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { Menu, Phone, X } from "lucide-react";
import Logo from "@/components/logo";
import { company, primaryPhone, waLink } from "@/data/site";

/* Абсолютные якоря: работают и с главной, и со страницы политики или 404 */
const nav = [
  { href: "/#katalog", label: "Каталог" },
  { href: "/#proekty", label: "Проекты" },
  { href: "/#materialy", label: "Материалы" },
  { href: "/#otzyvy", label: "Отзывы" },
  { href: "/#faq", label: "Вопросы" },
  { href: "/#kontakty", label: "Контакты" },
];

export default function SiteHeader() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  /**
   * На главной первый экран — фотография, и шапка лежит прямо на ней.
   * Пока страница не прокручена, весь текст шапки светлый; после прокрутки
   * шапка получает светлый фон и обычные тёмные цвета.
   */
  const overHero = pathname === "/" && !scrolled && !open;

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 16);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Блокировка прокрутки под открытым меню
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <header
      className={`sticky top-0 z-50 transition-[background-color,border-color,backdrop-filter] duration-300 ${
        scrolled || open
          ? "border-b border-line bg-paper/92 backdrop-blur-md"
          : "border-b border-transparent bg-transparent"
      }`}
    >
      <div className="shell flex h-16 items-center justify-between gap-4 lg:h-20">
        <a
          href="/"
          className="inline-flex min-h-11 shrink-0 items-center"
          onClick={(event) => {
            setOpen(false);
            // С главной поднимаемся наверх и убираем старый якорь из адреса,
            // с других страниц — обычный переход домой
            if (pathname === "/") {
              event.preventDefault();
              if (window.location.hash) {
                window.history.replaceState(
                  null,
                  "",
                  window.location.pathname + window.location.search,
                );
              }
              window.scrollTo({
                top: 0,
                behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches
                  ? "auto"
                  : "smooth",
              });
            }
          }}
          aria-label={`${company.fullName} — на главную`}
        >
          <Logo compact tone={overHero ? "light" : "dark"} />
        </a>

        <nav aria-label="Основная навигация" className="hidden xl:block">
          <ul className="flex items-center gap-7">
            {nav.map((item) => (
              <li key={item.href}>
                <a
                  href={item.href}
                  className={`relative text-[14px] font-medium transition-colors after:absolute after:-bottom-1.5 after:left-0 after:h-px after:w-0 after:bg-accent after:transition-[width] after:duration-300 hover:after:w-full ${
                    overHero
                      ? "text-paper/85 hover:text-paper"
                      : "text-ink-2 hover:text-ink"
                  }`}
                >
                  {item.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <div className="flex items-center gap-2 sm:gap-4">
          <a
            href={`tel:${primaryPhone.tel}`}
            className={`hidden items-center gap-2 text-[14px] font-semibold transition-colors md:inline-flex ${
              overHero ? "text-paper hover:text-paper/80" : "text-ink"
            }`}
          >
            <Phone
              className={`h-4 w-4 ${overHero ? "text-accent-2" : "text-accent"}`}
              aria-hidden="true"
            />
            <span className="whitespace-nowrap">{primaryPhone.label}</span>
          </a>

          <a
            href="/#raschet"
            className={`btn hidden sm:inline-flex ${
              overHero
                ? "btn-accent"
                : "btn-primary"
            }`}
          >
            Рассчитать стоимость
          </a>

          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            aria-controls="mobile-menu"
            aria-label={open ? "Закрыть меню" : "Открыть меню"}
            className={`-mr-2 inline-flex h-11 w-11 items-center justify-center transition-colors xl:hidden ${
              overHero ? "text-paper" : "text-ink"
            }`}
          >
            {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Мобильное меню */}
      <div
        id="mobile-menu"
        hidden={!open}
        className="border-t border-line bg-paper xl:hidden"
      >
        <div className="shell max-h-[calc(100dvh-4rem)] overflow-y-auto py-6">
          <ul className="flex flex-col">
            {nav.map((item) => (
              <li key={item.href}>
                <a
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className="flex items-center justify-between border-b border-line py-4 text-[19px] font-medium tracking-[-0.01em] text-ink"
                >
                  {item.label}
                </a>
              </li>
            ))}
          </ul>

          <div className="mt-6 flex flex-col gap-3">
            <a
              href="/#raschet"
              onClick={() => setOpen(false)}
              className="btn btn-primary w-full"
            >
              Рассчитать стоимость
            </a>
            <a
              href={waLink(0, "Здравствуйте! Пишу с сайта MEGAPLAST KZ.")}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => setOpen(false)}
              className="btn btn-outline w-full"
            >
              Написать в WhatsApp
            </a>
          </div>

          <div className="mt-6 space-y-2 pb-2 text-[15px]">
            {company.phones.map((p) => (
              <a
                key={p.tel}
                href={`tel:${p.tel}`}
                className="flex items-center gap-2 font-semibold text-ink"
              >
                <Phone className="h-4 w-4 text-accent" aria-hidden="true" />
                {p.label}
              </a>
            ))}
            <p className="pt-1 text-[13px] text-ink-3">
              {company.addressFull}
            </p>
          </div>
        </div>
      </div>
    </header>
  );
}
