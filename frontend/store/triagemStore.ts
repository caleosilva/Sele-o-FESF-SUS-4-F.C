import { create } from "zustand";

export type CorRisco = "verde" | "amarelo" | "laranja" | "vermelho";

export interface Paciente {
  id: number;
  nome: string;
  cpf: string;
}

export interface Triagem {
  id: number;
  paciente_id: number;
  paciente: Paciente;
  cor_risco: CorRisco;
  queixa_principal: string;
  created_at: string;
}

interface TriagemState {
  fila: Triagem[];
  setFila: (fila: Triagem[]) => void;
  adicionarTriagem: (triagem: Triagem) => void;
  atualizarStatus: (id: number, cor_risco: CorRisco) => void;
  limparFila: () => void;
}

export const useTriagemStore = create<TriagemState>((set) => ({
  fila: [],

  setFila: (fila) => set({ fila }),

  adicionarTriagem: (triagem) =>
    set((state) => ({ fila: [...state.fila, triagem] })),

  atualizarStatus: (id, cor_risco) =>
    set((state) => ({
      fila: state.fila.map((t) => (t.id === id ? { ...t, cor_risco } : t)),
    })),

  limparFila: () => set({ fila: [] }),
}));
