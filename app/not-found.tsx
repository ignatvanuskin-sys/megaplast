import { ArrowRight, MessageCircle, Phone } from "lucide-react";
import SiteHeader from "@/components/site-header";
import SiteFooter from "@/components/site-footer";
import { company, primaryPhone, waLink } from "@/data/site";

export default function NotFound() {
  const links = [
    { href: "/#katalog", label: "Каталог изделий" },
    { href: "/#proekty", label: "Реализованные проекты" },
    { href: "/#raschet", label: "Расчёт стоимости" },
    { href: "/#kontakty", label: "Контакты и адрес" },
  ];

  return (
    <>
      <SiteHeader />

      <main id="main" className="shell py-16 sm:py-20 lg:py-28">
        <div className="grid gap-12 lg:grid-cols-12">
          <div className="lg:col-span-7">
            <p className="eyebrow">Ошибка 404</p>
            <p
              aria-hidden="true"
              className="mt-4 text-[clamp(3.5rem,14vw,7rem)] font-light leading-none tracking-[-0.05em] text-paper-3"
            >
              404
            </p>
            <h1 className="mt-6 text-[clamp(1.75rem,4.4vw,2.75rem)] font-semibold leading-[1.05] tracking-[-0.03em]">
              Такой страницы нет
            </h1>
            <p className="mt-5 max-w-[38rem] text-[16px] leading-[1.65] text-ink-2">
              Возможно, ссылка устарела или в адресе опечатка. Ничего страшного —
              вернитесь на главную или сразу перейдите к тому, что нужно.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <a href="/" className="btn btn-primary group">
                На главную
                <ArrowRight
                  className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1"
                  aria-hidden="true"
                />
              </a>
              <a href="/#raschet" className="btn btn-outline">
                Рассчитать стоимость
              </a>
            </div>

            <div className="mt-10 flex flex-col gap-3 sm:flex-row">
              <a href={`tel:${primaryPhone.tel}`} className="btn btn-outline">
                <Phone className="h-4 w-4 text-accent" aria-hidden="true" />
                {primaryPhone.label}
              </a>
              <a
                href={waLink(0, "Здравствуйте! Не нашёл нужную страницу на сайте.")}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-outline"
              >
                <MessageCircle className="h-4 w-4 text-accent" aria-hidden="true" />
                WhatsApp
              </a>
            </div>
          </div>

          <nav aria-label="Разделы сайта" className="lg:col-span-5 lg:col-start-8">
            <p className="eyebrow">Куда дальше</p>
            <ul className="mt-4 border-t border-line">
              {links.map((link) => (
                <li key={link.href}>
                  <a
                    href={link.href}
                    className="flex min-h-14 items-center justify-between gap-4 border-b border-line text-[15.5px] font-medium text-ink transition-colors hover:text-accent"
                  >
                    {link.label}
                    <ArrowRight className="h-4 w-4 text-accent" aria-hidden="true" />
                  </a>
                </li>
              ))}
            </ul>
            <p className="mt-6 text-[13px] leading-[1.6] text-ink-3">
              {company.fullName} · {company.addressFull}
            </p>
          </nav>
        </div>
      </main>

      <SiteFooter />
    </>
  );
}
