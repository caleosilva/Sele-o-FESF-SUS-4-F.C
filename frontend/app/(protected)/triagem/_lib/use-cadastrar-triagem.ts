"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import axios from "axios";
import api from "@/lib/api/axios";
import { triagemSchema, triagemDefaultValues, type TriagemValues } from "./schema";
import type { Paciente } from "@/app/(protected)/pacientes/_lib/schema";

export function useCadastrarTriagem({ onSuccess }: { onSuccess: () => void }) {
  const [submetendo, setSubmetendo] = useState(false);
  const [erro, setErro] = useState("");
  const [pacienteEncontrado, setPacienteEncontrado] = useState<Paciente | null>(null);

  const form = useForm<TriagemValues>({
    resolver: zodResolver(triagemSchema),
    defaultValues: triagemDefaultValues,
  });

  const limparErro = () => setErro("");

  const resetForm = () => {
    form.reset();
    setPacienteEncontrado(null);
  };

  function onPacienteChange(paciente: Paciente | null) {
    setPacienteEncontrado(paciente);
    if (paciente) {
      form.setValue("paciente_id", paciente.id);
      form.clearErrors("paciente_id");
    } else {
      form.resetField("paciente_id");
    }
  }

  async function onSubmit(values: TriagemValues) {
    setErro("");
    setSubmetendo(true);
    try {
      await api.post("/triagens/", {
        paciente_id:      values.paciente_id,
        cor_risco:        values.cor_risco,
        queixa_principal: values.queixa_principal,
      });
      resetForm();
      onSuccess();
    } catch (err: unknown) {
      if (!axios.isAxiosError(err)) { setErro("Erro inesperado."); return; }
      switch (err.response?.status) {
        case 403: setErro("Apenas enfermeiros podem registrar triagens."); break;
        case 422: setErro("Dados inválidos. Verifique os campos."); break;
        default:  setErro("Erro ao registrar triagem. Tente novamente.");
      }
    } finally {
      setSubmetendo(false);
    }
  }

  return { form, onSubmit, submetendo, erro, limparErro, resetForm, pacienteEncontrado, onPacienteChange };
}
