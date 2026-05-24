import { z } from "zod";

const nomeField = z
  .string()
  .min(3, "Nome deve ter pelo menos 3 caracteres.")
  .max(100, "Nome muito longo.");

const dataNascimentoField = z
  .string()
  .min(1, "Data de nascimento obrigatória.")
  .refine((v) => !isNaN(Date.parse(v)), "Data inválida.")
  .refine(
    (v) => v <= new Date().toISOString().slice(0, 10),
    "A data de nascimento não pode ser futura.",
  );

export const pacienteSchema = z.object({
  nome: nomeField,
  cpf: z
    .string()
    .min(1, "CPF obrigatório.")
    .refine((v) => v.replace(/\D/g, "").length === 11, "CPF deve ter 11 dígitos."),
  data_nascimento: dataNascimentoField,
  telefone: z.string().optional(),
});

export type PacienteValues = z.infer<typeof pacienteSchema>;

export const pacienteDefaultValues: PacienteValues = {
  nome: "",
  cpf: "",
  data_nascimento: "",
  telefone: "",
};

export interface Paciente {
  id: number;
  nome: string;
  cpf: string;
  data_nascimento: string;
  telefone?: string | null;
  created_at: string;
  updated_at: string;
}
