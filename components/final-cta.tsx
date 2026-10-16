import Image from "next/image";
import { ArrowRight, MessageCircle } from "lucide-react";
import { waLink } from "@/data/site";

export default function FinalCta() {
  return (
    <section id="obsudim" className="relative isolate overflow-hidden bg-ink">
      <Image
        src="/images/projects/project-06.jpg"
        alt="Одноэтажный дом с панорамным остеклением в вечернем свете — объект MEGAPLAST KZ"
        fill
        loading="lazy"
        sizes="100vw"
        className="object-cover object-center opacity-70"
      />
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-linear-to-r from-ink via-ink/80 to-ink/30"
      />

      <div className="shell relative py-20 sm:py-24 lg:py-32">
        <div className="max-w-[40rem]" data-reveal>
          <p className="eyebrow text-paper/55">Финальный шаг</p>
          <h2 className="mt-4 text-[clamp(2rem,5.4vw,3.5rem)] font-semibold leading-[1.02] tracking-[-0.035em] text-paper">
            Обсудим ваш проект?
          </h2>
          <p className="mt-6 max-w-[34rem] text-[16.5px] leading-[1.6] text-paper/75">
            Пришлите размеры или просто опишите задачу: сколько окон нужно, что за
            объект, что не устраивает в текущих окнах. Мы подберём систему,
            подскажем по стеклопакету и посчитаем стоимость — без обязательств.
          </p>

          <div className="mt-9 flex flex-col gap-3 sm:flex-row">
            <a href="#raschet" className="btn btn-accent group">
              Рассчитать стоимость
              <ArrowRight
                className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1"
                aria-hidden="true"
              />
            </a>
            <a
              href={waLink(0, "Здравствуйте! Хочу обсудить проект остекления.")}
              target="_blank"
              rel="noopener noreferrer"
              className="btn border border-paper/30 text-paper hover:border-paper hover:bg-paper/10"
            >
              <MessageCircle className="h-4 w-4" aria-hidden="true" />
              Написать в WhatsApp
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
