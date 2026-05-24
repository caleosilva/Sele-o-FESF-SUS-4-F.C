"use client";

import { usePathname } from "next/navigation";

const PAGE_LABELS: { prefix: string; label: string }[] = [
  { prefix: "/triagem",  label: "Triagem" },
  { prefix: "/pacientes", label: "Pacientes" },
];

export function PageHeader() {
  const pathname = usePathname();
  const match = PAGE_LABELS.find(({ prefix }) => pathname.startsWith(prefix));

  if (!match) return null;

  return (
    <header className="border-b bg-background px-6 py-4 shrink-0">
      <h1 className="text-lg font-semibold">{match.label}</h1>
    </header>
  );
}
