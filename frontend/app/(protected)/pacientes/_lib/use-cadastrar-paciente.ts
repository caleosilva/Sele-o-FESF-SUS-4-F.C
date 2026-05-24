"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import axios from "axios";
import api from "@/lib/api/axios";
import { pacienteSchema, pacienteDefaultValues, type PacienteValues } from "./schema";

export function useCadastrarPaciente({ onSuccess }: { onSuccess: () => void }) {
  const [submetendo, setSubmetendo] = useState(false);
  const [erro, setErro] = useState("");

  const form = useForm<PacienteValues>({
    resolver: zodResolver(pacienteSchema),
    defaultValues: pacienteDefaultValues,
  });

  const limparErro = () => setErro("");

  async function onSubmit(values: PacienteValues) {
    setErro("");
    setSubmetendo(true);
    try {
      await api.post("/pacientes/", {
        ...values,
        cpf: values.cpf.replace(/\D/g, ""),
        telefone: values.telefone?.trim() || undefined,
      });
      form.reset();
      onSuccess();
    } catch (err: unknown) {
      if (!axios.isAxiosError(err)) { setErro("Erro inesperado."); return; }
      switch (err.response?.status) {
        case 409: setErro("CPF já cadastrado no sistema."); break;
        case 422: setErro("Dados inválidos. Verifique os campos."); break;
        default:  setErro("Erro ao cadastrar paciente. Tente novamente.");
      }
    } finally {
      setSubmetendo(false);
    }
  }

  return { form, onSubmit, submetendo, erro, limparErro };
}
