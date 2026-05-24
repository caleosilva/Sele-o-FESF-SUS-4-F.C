import { create } from "zustand";

export interface Usuario {
  email: string;
  perfil: "recepcionista" | "enfermeiro" | "medico";
}

interface AuthState {
  usuario: Usuario | null;
  login: (usuario: Usuario) => void;
  logout: () => void;
  isAuthenticated: () => boolean;
}

export const useAuthStore = create<AuthState>()((set, get) => ({
  usuario: null,

  login: (usuario) => set({ usuario }),

  logout: () => set({ usuario: null }),

  isAuthenticated: () => !!get().usuario,
}));
