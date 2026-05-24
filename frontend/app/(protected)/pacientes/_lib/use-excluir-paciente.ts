import { useState } from "react";
import axios from "axios";
import api from "@/lib/api/axios";

export function useExcluirPaciente({ onSuccess }: { onSuccess: () => void }) {
  const [submetendo, setSubmetendo] = useState(false);
  const [erro, setErro] = useState("");

  async function excluir(id: number) {
    setErro("");
    setSubmetendo(true);
    try {
      await api.delete(`/pacientes/${id}`);
      onSuccess();
    } catch (err: unknown) {
      if (!axios.isAxiosError(err)) { setErro("Erro inesperado."); return; }
      if (err.response?.status === 409 || err.response?.status === 422)
        setErro("Não é possível excluir este paciente pois há registros vinculados.");
      else
        setErro("Erro ao excluir paciente. Tente novamente.");
    } finally {
      setSubmetendo(false);
    }
  }

  return { excluir, submetendo, erro, limparErro: () => setErro("") };
}
