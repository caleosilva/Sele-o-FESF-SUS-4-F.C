"use client";

import { useEffect } from "react";
import { useAuthStore } from "@/store/authStore";
import api from "@/lib/api/axios";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { usuario, login } = useAuthStore();

  useEffect(() => {
    if (usuario) return;

    api
      .get<{ email: string; perfil: string }>("/auth/me")
      .then(({ data }) =>
        login({
          email: data.email,
          perfil: data.perfil as "recepcionista" | "enfermeiro" | "medico",
        })
      )
      .catch(() => {});
  }, []);

  return <>{children}</>;
}
