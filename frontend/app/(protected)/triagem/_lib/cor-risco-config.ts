import type { CorRisco } from "@/store/triagemStore";

export const COR_CONFIG: Record<CorRisco, { label: string; shortLabel: string; dot: string; bar: string; badge: string }> = {
  vermelho: {
    label:      "Vermelho — Emergência",
    shortLabel: "Vermelho",
    dot:        "bg-red-600",
    bar:        "bg-red-600",
    badge:      "bg-red-100 text-red-700 border-red-300",
  },
  laranja: {
    label:      "Laranja — Muito urgente",
    shortLabel: "Laranja",
    dot:        "bg-orange-500",
    bar:        "bg-orange-500",
    badge:      "bg-orange-100 text-orange-700 border-orange-300",
  },
  amarelo: {
    label:      "Amarelo — Urgente",
    shortLabel: "Amarelo",
    dot:        "bg-yellow-400",
    bar:        "bg-yellow-400",
    badge:      "bg-yellow-100 text-yellow-700 border-yellow-300",
  },
  verde: {
    label:      "Verde — Pouco urgente",
    shortLabel: "Verde",
    dot:        "bg-green-500",
    bar:        "bg-green-500",
    badge:      "bg-green-100 text-green-700 border-green-300",
  },
};
