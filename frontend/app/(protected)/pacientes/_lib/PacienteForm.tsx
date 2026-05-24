"use client";

import { UseFormReturn } from "react-hook-form";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import FormFieldBasic from "@/components/components/form-field";
import { formatarCpf, formatarCpfInput } from "@/lib/utils/formatters";
import type { PacienteValues } from "./schema";

interface PacienteFormProps {
  form: UseFormReturn<PacienteValues>;
  formId: string;
  onSubmit: (values: PacienteValues) => void;
  cpfReadOnly?: boolean;
}

export function PacienteForm({ form, formId, onSubmit, cpfReadOnly = false }: PacienteFormProps) {
  return (
    <Form {...form}>
      <form id={formId} onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormFieldBasic form={form} name="nome" label="Nome completo" placeholder="João da Silva" obrigatorio />

        <FormField
          control={form.control}
          name="cpf"
          render={({ field }) => (
            <FormItem>
              <FormLabel>CPF <span className="text-destructive ml-1">*</span></FormLabel>
              <FormControl>
                {cpfReadOnly ? (
                  <Input value={formatarCpf(field.value)} disabled />
                ) : (
                  <Input
                    placeholder="000.000.000-00"
                    value={field.value}
                    onChange={(e) => field.onChange(formatarCpfInput(e.target.value))}
                  />
                )}
              </FormControl>
              {cpfReadOnly && (
                <p className="text-xs text-muted-foreground">O CPF não pode ser alterado.</p>
              )}
              <FormMessage />
            </FormItem>
          )}
        />

        <FormFieldBasic form={form} name="data_nascimento" label="Data de nascimento" type="date" obrigatorio />
        <FormFieldBasic form={form} name="telefone" label="Telefone" placeholder="(71) 99999-0000" type="tel" />
      </form>
    </Form>
  );
}
