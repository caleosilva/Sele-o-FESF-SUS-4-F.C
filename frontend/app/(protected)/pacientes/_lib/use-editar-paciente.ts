"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import axios from "axios";
import api from "@/lib/api/axios";
import { pacienteSchema, pacienteDefaultValues, type PacienteValues, type Paciente } from "./schema";

export function useEditarPaciente({ onSuccess }: { onSuccess: () => void }) {
  const [submetendo, setSubmetendo] = useState(false);
  const [erro, setErro] = useState("");
  const [idAtual, setIdAtual] = useState<number | null>(null);

  const form = useForm<PacienteValues>({
    resolver: zodResolver(pacienteSchema),
    defaultValues: pacienteDefaultValues,
  });

  const limparErro = () => setErro("");

  function popular(paciente: Paciente) {
    setIdAtual(paciente.id);
    form.reset({
      nome: paciente.nome,
      cpf: paciente.cpf,
      data_nascimento: paciente.data_nascimento.split("T")[0],
      telefone: paciente.telefone ?? "",
    });
  }

  async function onSubmit(values: PacienteValues) {
    if (!idAtual) return;
    setErro("");
    setSubmetendo(true);
    try {
      await api.put(`/pacientes/${idAtual}`, {
        nome: values.nome,
        data_nascimento: values.data_nascimento,
        telefone: values.telefone?.trim() || null,
      });
      onSuccess();
    } catch (err: unknown) {
      if (!axios.isAxiosError(err)) { setErro("Erro inesperado."); return; }
      switch (err.response?.status) {
        case 422: setErro("Dados inválidos. Verifique os campos."); break;
        default:  setErro("Erro ao atualizar paciente. Tente novamente.");
      }
    } finally {
      setSubmetendo(false);
    }
  }

  return { form, onSubmit, popular, submetendo, erro, limparErro };
}
