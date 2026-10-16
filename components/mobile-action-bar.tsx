"use client";

import { useEffect, useState } from "react";
import { Phone } from "lucide-react";
import { WhatsappIcon } from "@/components/icons";
import { primaryPhone, waLink } from "@/data/site";

/** Ненавязчивая нижняя панель действий — только на небольших экранах. */
export default function MobileActionBar() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 560);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div
      className={`fixed inset-x-0 bottom-0 z-[60] border-t border-line bg-paper/95 backdrop-blur-md transition-transform duration-300 sm:hidden ${
        visible ? "translate-y-0" : "translate-y-full"
      }`}
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
      aria-hidden={!visible}
    >
      <div className="grid grid-cols-2 gap-px bg-line">
        <a
          href={`tel:${primaryPhone.tel}`}
          className="flex min-h-14 items-center justify-center gap-2 bg-paper text-[14.5px] font-semibold text-ink"
          tabIndex={visible ? 0 : -1}
        >
          <Phone className="h-4 w-4 text-accent" aria-hidden="true" />
          Позвонить
        </a>
        <a
          href={waLink(0, "Здравствуйте! Хочу рассчитать стоимость окон.")}
          target="_blank"
          rel="noopener noreferrer"
          className="flex min-h-14 items-center justify-center gap-2 bg-ink text-[14.5px] font-semibold text-paper"
          tabIndex={visible ? 0 : -1}
        >
          <WhatsappIcon className="h-4 w-4" />
          WhatsApp
        </a>
      </div>
    </div>
  );
}
