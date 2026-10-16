import { Phone } from "lucide-react";
import Logo from "@/components/logo";
import { InstagramIcon, WhatsappIcon } from "@/components/icons";
import { company, profileSystems, waLink } from "@/data/site";

const year = new Date().getFullYear();

export default function SiteFooter() {
  return (
    <footer className="bg-ink text-paper">
      <div className="shell pt-16 pb-28 sm:pb-16 lg:pt-20">
        <div className="grid gap-10 lg:grid-cols-12 lg:gap-14">
          <div className="lg:col-span-4">
            <Logo tone="light" />
            <p className="mt-5 max-w-[26rem] text-[14px] leading-[1.65] text-paper/60">
              Изготовление и установка окон из ПВХ и алюминия, дверей, витражей и
              остекление балконов в Алматы. Замер, доставка и монтаж — бесплатно.
            </p>

            <div className="mt-6 flex flex-wrap gap-3">
              <a
                href={waLink(0, "Здравствуйте! Пишу с сайта MEGAPLAST KZ.")}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex min-h-11 items-center gap-2 border border-paper/25 px-4 text-[13.5px] font-medium transition-colors hover:border-paper hover:bg-paper/10"
              >
                <WhatsappIcon className="h-4 w-4" />
                WhatsApp
              </a>
              <a
                href={company.instagram}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex min-h-11 items-center gap-2 border border-paper/25 px-4 text-[13.5px] font-medium transition-colors hover:border-paper hover:bg-paper/10"
              >
                <InstagramIcon className="h-4 w-4" />
                Instagram
              </a>
            </div>
          </div>

          <nav className="lg:col-span-3" aria-label="Разделы сайта">
            <h2 className="eyebrow text-paper/50">Разделы</h2>
            <ul className="mt-3 text-[14px]">
              {[
                ["/#katalog", "Каталог"],
                ["/#proekty", "Проекты"],
                ["/#process", "Как заказываем"],
                ["/#materialy", "Материалы"],
                ["/#otzyvy", "Отзывы"],
                ["/#faq", "Вопросы"],
                ["/#kontakty", "Контакты"],
              ].map(([href, label]) => (
                <li key={href}>
                  <a
                    href={href}
                    className="inline-flex min-h-11 items-center text-paper/70 transition-colors hover:text-paper"
                  >
                    {label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          <div className="lg:col-span-5">
            <h2 className="eyebrow text-paper/50">Контакты</h2>
            <div className="mt-5 space-y-3 text-[14px]">
              {company.phones.map((p, i) => (
                <a
                  key={p.tel}
                  href={`tel:${p.tel}`}
                  className="flex items-center gap-2.5 font-medium text-paper/80 transition-colors hover:text-paper"
                >
                  <Phone className="h-4 w-4 text-accent-2" aria-hidden="true" />
                  {p.label}
                </a>
              ))}
              <p className="text-paper/60">{company.addressFull}</p>
              <p className="text-paper/60">
                {company.hoursLabel}{" "}
                <span className="text-paper/55">({company.hoursNote})</span>
              </p>
              <a
                href={company.twoGis}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block font-medium text-paper/80 underline decoration-paper/25 underline-offset-4 transition-colors hover:text-paper"
              >
                Карточка компании в 2ГИС
              </a>
            </div>

            <h2 className="eyebrow mt-8 text-paper/50">Профильные системы</h2>
            <p className="mt-4 text-[13px] leading-[1.7] text-paper/55">
              {profileSystems.map((p) => p.name).join(" · ")}
            </p>
          </div>
        </div>

        <div className="mt-14 border-t border-paper/15 pt-6">
          <div className="flex flex-col gap-4 text-[12.5px] text-paper/50 lg:flex-row lg:items-start lg:justify-between">
            <p>
              © {year} {company.fullName}. {company.directoryName}.
            </p>
            <div className="flex flex-wrap items-center gap-x-6">
              <a
                href="/privacy"
                className="inline-flex min-h-11 items-center underline decoration-paper/25 underline-offset-4 hover:text-paper"
              >
                Политика обработки персональных данных
              </a>
              <a
                href={company.twoGis}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex min-h-11 items-center underline decoration-paper/25 underline-offset-4 hover:text-paper"
              >
                2ГИС
              </a>
              <a
                href={company.instagram}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex min-h-11 items-center underline decoration-paper/25 underline-offset-4 hover:text-paper"
              >
                {company.instagramHandle}
              </a>
            </div>
          </div>
          <p className="mt-5 max-w-[70rem] text-[12px] leading-[1.65] text-paper/55">
            Фотографии объектов, образцов и офиса опубликованы в карточке компании
            в 2ГИС и принадлежат их авторам. Характеристики профильных систем
            указаны по карточкам производителя на образцах в шоуруме. Сведения о
            рейтинге и отзывах — по данным 2ГИС на дату публикации.
          </p>
        </div>
      </div>
    </footer>
  );
}
