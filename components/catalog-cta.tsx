"use client";

import { ArrowRight } from "lucide-react";
import { requestProduct, scrollToForm } from "@/lib/bridge";

/** Кнопка каталога: подставляет изделие в форму и подводит к ней. */
export default function CatalogCta({
  product,
  label = "Рассчитать",
  variant = "link",
}: {
  product: string;
  label?: string;
  variant?: "link" | "solid";
}) {
  const handle = () => {
    requestProduct(product);
    scrollToForm();
  };

  if (variant === "solid") {
    return (
      <button type="button" onClick={handle} className="btn btn-primary group w-full sm:w-auto">
        {label}
        <ArrowRight
          className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1"
          aria-hidden="true"
        />
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={handle}
      className="group inline-flex min-h-11 items-center gap-2 text-[14px] font-semibold text-ink"
    >
      {label}
      <ArrowRight
        className="h-4 w-4 text-accent transition-transform duration-300 group-hover:translate-x-1"
        aria-hidden="true"
      />
    </button>
  );
}
