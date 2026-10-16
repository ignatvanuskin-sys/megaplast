import Image from "next/image";
import { Clock, MapPin, MessageCircle, Phone } from "lucide-react";
import { InstagramIcon } from "@/components/icons";
import { company, waLink } from "@/data/site";

export default function Contacts() {
  return (
    <section id="kontakty" className="scroll-mt-24 py-16 sm:py-20 lg:py-28">
      <div className="shell">
        <div className="grid gap-12 lg:grid-cols-12 lg:gap-14">
          <div className="lg:col-span-5">
            <div data-reveal>
              <p className="eyebrow">Контакты</p>
              <h2 className="mt-4 text-[clamp(1.75rem,4.2vw,2.75rem)] font-semibold leading-[1.05] tracking-[-0.03em]">
                Офис и производство в Шанырак-2
              </h2>
            </div>

            <dl className="mt-9 space-y-7">
              <div className="border-t border-line pt-5" data-reveal>
                <dt className="eyebrow flex items-center gap-2">
                  <Phone className="h-3.5 w-3.5 text-accent" aria-hidden="true" />
                  Телефоны
                </dt>
                <dd className="mt-3 space-y-2">
                  {company.phones.map((p) => (
                    <div key={p.tel} className="flex flex-wrap items-center gap-x-4 gap-y-1">
                      <a
                        href={`tel:${p.tel}`}
                        className="text-[19px] font-semibold tracking-[-0.02em] hover:text-accent"
                      >
                        {p.label}
                      </a>
                      <a
                        href={waLink(company.phones.indexOf(p), "Здравствуйте! Пишу с сайта MEGAPLAST KZ.")}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[13px] font-medium text-ink-3 underline decoration-line-2 underline-offset-2 hover:text-ink hover:decoration-accent"
                      >
                        WhatsApp
                      </a>
                    </div>
                  ))}
                </dd>
              </div>

              <div className="border-t border-line pt-5" data-reveal>
                <dt className="eyebrow flex items-center gap-2">
                  <MapPin className="h-3.5 w-3.5 text-accent" aria-hidden="true" />
                  Адрес
                </dt>
                <dd className="mt-3 text-[15px] leading-[1.6] text-ink-2">
                  {company.addressFull}
                  <a
                    href={company.twoGis}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-2 block text-[13.5px] font-semibold text-ink underline decoration-accent/40 underline-offset-2 hover:decoration-accent"
                  >
                    Открыть в 2ГИС и построить маршрут
                  </a>
                </dd>
              </div>

              <div className="border-t border-line pt-5" data-reveal>
                <dt className="eyebrow flex items-center gap-2">
                  <Clock className="h-3.5 w-3.5 text-accent" aria-hidden="true" />
                  График работы
                </dt>
                <dd className="mt-3 text-[15px] text-ink-2">
                  {company.hoursLabel}
                  <span className="mt-1 block text-[12.5px] text-ink-3">
                    {company.hoursNote}
                  </span>
                </dd>
              </div>

              <div className="border-t border-line pt-5" data-reveal>
                <dt className="eyebrow flex items-center gap-2">
                  <MessageCircle className="h-3.5 w-3.5 text-accent" aria-hidden="true" />
                  Мессенджеры и соцсети
                </dt>
                <dd className="mt-3 flex flex-wrap gap-3">
                  <a
                    href={waLink(0, "Здравствуйте! Пишу с сайта MEGAPLAST KZ.")}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-outline"
                  >
                    WhatsApp
                  </a>
                  <a
                    href={company.instagram}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-outline"
                  >
                    <InstagramIcon className="h-4 w-4 text-accent" />
                    {company.instagramHandle}
                  </a>
                </dd>
              </div>

              <div className="border-t border-line pt-5" data-reveal>
                <dt className="eyebrow">Оплата</dt>
                <dd className="mt-3 text-[14.5px] leading-[1.6] text-ink-2">
                  {company.payments.join(" · ")}
                </dd>
              </div>
            </dl>
          </div>

          {/* Офис и локация */}
          <div className="lg:col-span-7">
            <figure className="frame aspect-4/3 lg:aspect-16/10" data-reveal>
              <Image
                src="/images/projects/project-07.jpg"
                alt="Офис MEGAPLAST в Шанырак-2: вывеска с направлениями «Двери», «Витражи», «Окно» и списком услуг"
                fill
                loading="lazy"
                sizes="(max-width: 1023px) 100vw, 58vw"
                className="object-cover"
              />
            </figure>
            <figcaption className="mt-3 text-[12px] uppercase tracking-[0.12em] text-ink-3">
              Офис на ул. Жанкожа батыра, 23 · фото из карточки 2ГИС
            </figcaption>

            {/* Карточка локации вместо встраиваемой карты */}
            <div className="mt-6 grid gap-px border border-line bg-line sm:grid-cols-3">
              <div className="bg-paper p-5">
                <p className="eyebrow">Координаты</p>
                <p className="mt-2 text-[14px] font-medium">
                  {company.geo.lat.toFixed(6)}, {company.geo.lng.toFixed(6)}
                </p>
              </div>
              <div className="bg-paper p-5">
                <p className="eyebrow">Район</p>
                <p className="mt-2 text-[14px] font-medium">{company.district}</p>
              </div>
              <div className="bg-paper p-5">
                <p className="eyebrow">Индекс</p>
                <p className="mt-2 text-[14px] font-medium">{company.postalCode}</p>
              </div>
            </div>

            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <a
                href="/#raschet"
                className="btn btn-primary"
              >
                Оставить заявку на расчёт
              </a>
              <a
                href={waLink(0, "Здравствуйте! Подскажите, как добраться до офиса.")}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-outline"
              >
                Спросить в WhatsApp
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
