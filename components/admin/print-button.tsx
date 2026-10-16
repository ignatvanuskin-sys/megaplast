"use client";

import { Printer } from "lucide-react";

export default function PrintButton() {
  return (
    <button
      type="button"
      onClick={() => window.print()}
      className="btn btn-primary"
    >
      <Printer className="h-4 w-4" aria-hidden="true" />
      Печать или PDF
    </button>
  );
}
