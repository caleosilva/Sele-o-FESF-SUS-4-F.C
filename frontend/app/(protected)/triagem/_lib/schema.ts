import { z } from "zod";
import type { DefaultValues } from "react-hook-form";

export const triagemSchema = z.object({
  paciente_id: z
    .number({ message: "Paciente não encontrado." })
    .int()
    .positive("Paciente não encontrado."),

  cor_risco: z.enum(["vermelho", "laranja", "amarelo", "verde"], {
    message: "Selecione a cor de risco.",
  }),

  queixa_principal: z
    .string()
    .min(5, "Descreva a queixa com pelo menos 5 caracteres.")
    .max(500, "Queixa muito longa."),
});

export type TriagemValues = z.infer<typeof triagemSchema>;

export const triagemDefaultValues: DefaultValues<TriagemValues> = {
  queixa_principal: "",
};
