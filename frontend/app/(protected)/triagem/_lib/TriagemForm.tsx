"use client";

import { useMemo } from "react";
import { UseFormReturn } from "react-hook-form";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { SearchBox } from "@/components/components/search-box";
import { formatarCpf } from "@/lib/utils/formatters";
import { type TriagemValues } from "./schema";
import { COR_CONFIG } from "./cor-risco-config";
import type { CorRisco } from "@/store/triagemStore";
import { PacientesController } from "@/app/(protected)/pacientes/pacientes.controller";
import type { Paciente } from "@/app/(protected)/pacientes/_lib/schema";

const COR_RISCO_ENTRIES = Object.entries(COR_CONFIG) as [CorRisco, (typeof COR_CONFIG)[CorRisco]][];

interface TriagemFormProps {
  form: UseFormReturn<TriagemValues>;
  formId: string;
  onSubmit: (values: TriagemValues) => void;
  pacienteEncontrado: Paciente | null;
  onPacienteChange: (paciente: Paciente | null) => void;
}

export function TriagemForm({
  form,
  formId,
  onSubmit,
  pacienteEncontrado,
  onPacienteChange,
}: TriagemFormProps) {
  const corSelecionada = form.watch("cor_risco");
  const controlador = useMemo(() => new PacientesController(), []);

  return (
    <Form {...form}>
      <form id={formId} onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">

        {/* Busca de paciente */}
        <div className="space-y-1">
          <SearchBox<Paciente>
            controlador={controlador}
            value={pacienteEncontrado}
            onChange={onPacienteChange}
            renderLabel={(p) => `${p.nome} — CPF ${formatarCpf(p.cpf)}`}
            label="Paciente"
            titulo="Selecionar Paciente"
            placeholder="Selecionar paciente…"
            obrigatorio
          />
          {form.formState.errors.paciente_id && (
            <p className="text-sm text-destructive">
              {form.formState.errors.paciente_id.message}
            </p>
          )}
        </div>

        {/* Cor de risco */}
        <FormField
          control={form.control}
          name="cor_risco"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Cor de risco <span className="text-destructive ml-1">*</span></FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione a prioridade…" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {COR_RISCO_ENTRIES.map(([value, cfg]) => (
                    <SelectItem key={value} value={value}>
                      <div className="flex items-center gap-2">
                        <span className={`inline-block h-2.5 w-2.5 rounded-full ${cfg.dot}`} />
                        {cfg.label}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {corSelecionada && (
                <Badge variant="outline" className={`text-xs border ${COR_CONFIG[corSelecionada].badge}`}>
                  {COR_CONFIG[corSelecionada].label}
                </Badge>
              )}
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Queixa principal */}
        <FormField
          control={form.control}
          name="queixa_principal"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Queixa principal <span className="text-destructive ml-1">*</span></FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Descreva os sintomas e motivo do atendimento…"
                  className="resize-none"
                  rows={4}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

      </form>
    </Form>
  );
}
