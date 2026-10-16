import { Plus } from "lucide-react";
import { faqs } from "@/data/content";
import { primaryPhone } from "@/data/site";

export default function Faq() {
  return (
    <section
      id="faq"
      className="scroll-mt-24 border-y border-line bg-paper-2 py-16 sm:py-20 lg:py-28"
    >
      <div className="shell">
        <div className="grid gap-10 lg:grid-cols-12 lg:gap-14">
          <div className="lg:col-span-4">
            <div className="lg:sticky lg:top-28" data-reveal>
              <p className="eyebrow">Вопросы и ответы</p>
              <h2 className="mt-4 text-[clamp(1.75rem,4.2vw,2.75rem)] font-semibold leading-[1.05] tracking-[-0.03em]">
                Что чаще всего спрашивают
              </h2>
              <p className="mt-5 text-[15.5px] leading-[1.65] text-ink-2">
                Если ответа нет — позвоните, разберёмся по вашей ситуации.
              </p>
              <a
                href={`tel:${primaryPhone.tel}`}
                className="btn btn-outline mt-6"
              >
                {primaryPhone.label}
              </a>
            </div>
          </div>

          <div className="lg:col-span-8">
            <div className="border-t border-line">
              {faqs.map((f, i) => (
                <details
                  key={f.q}
                  className="group border-b border-line"
                  data-reveal
                  style={{ "--reveal-delay": `${(i % 3) * 50}ms` } as React.CSSProperties}
                >
                  <summary className="flex cursor-pointer list-none items-start justify-between gap-6 py-5 marker:hidden">
                    <h3 className="text-[16.5px] font-semibold leading-[1.4] tracking-[-0.015em]">
                      {f.q}
                    </h3>
                    <span
                      aria-hidden="true"
                      className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center text-accent transition-transform duration-300 group-open:rotate-45"
                    >
                      <Plus className="h-5 w-5" />
                    </span>
                  </summary>
                  <div className="pb-6 pr-10">
                    <p className="max-w-[46rem] text-[14.5px] leading-[1.65] text-ink-2">
                      {f.a}
                    </p>
                  </div>
                </details>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
