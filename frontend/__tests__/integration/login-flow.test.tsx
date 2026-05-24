/**
 * Teste de integração do fluxo de login completo.
 *
 * Valida que o preenchimento do formulário → submit → resposta da API →
 * atualização do Zustand → redirecionamento funciona de ponta a ponta,
 * usando o store REAL (sem mock de módulo) para verificar o estado final.
 */

import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import LoginPage from "@/app/login/page";
import api from "@/lib/api/axios";
import { useAuthStore } from "@/store/authStore";

jest.mock("@/lib/api/axios", () => ({
  post: jest.fn(),
}));

const mockPush = jest.fn();
jest.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush }),
}));

beforeEach(() => {
  jest.clearAllMocks();
  // Reseta o store Zustand real para estado inicial antes de cada teste
  useAuthStore.setState({ usuario: null });
});

describe("Fluxo de login (integração)", () => {
  it("should store user credentials in Zustand after successful login", async () => {
    (api.post as jest.Mock).mockResolvedValue({
      data: { email: "enfermeiro@fesf.gov.br", perfil: "enfermeiro" },
    });

    render(<LoginPage />);
    await userEvent.type(screen.getByLabelText(/e-mail/i), "enfermeiro@fesf.gov.br");
    await userEvent.type(screen.getByLabelText(/senha/i), "senha_segura");
    await userEvent.click(screen.getByRole("button", { name: /entrar/i }));

    await waitFor(() => {
      const { usuario } = useAuthStore.getState();
      expect(usuario?.email).toBe("enfermeiro@fesf.gov.br");
      expect(usuario?.perfil).toBe("enfermeiro");
    });
  });

  it("should redirect to /triagem after successful login", async () => {
    (api.post as jest.Mock).mockResolvedValue({
      data: { email: "medico@fesf.gov.br", perfil: "medico" },
    });

    render(<LoginPage />);
    await userEvent.type(screen.getByLabelText(/e-mail/i), "medico@fesf.gov.br");
    await userEvent.type(screen.getByLabelText(/senha/i), "senha_medico");
    await userEvent.click(screen.getByRole("button", { name: /entrar/i }));

    await waitFor(() => expect(mockPush).toHaveBeenCalledWith("/triagem"));
  });

  it("should not update Zustand store when login fails", async () => {
    (api.post as jest.Mock).mockRejectedValue({ response: { status: 401 } });

    render(<LoginPage />);
    await userEvent.type(screen.getByLabelText(/e-mail/i), "wrong@fesf.gov.br");
    await userEvent.type(screen.getByLabelText(/senha/i), "senha_errada");
    await userEvent.click(screen.getByRole("button", { name: /entrar/i }));

    await waitFor(() =>
      expect(screen.getByText(/e-mail ou senha incorretos/i)).toBeInTheDocument()
    );

    // O store deve permanecer sem usuário autenticado
    expect(useAuthStore.getState().usuario).toBeNull();
  });

  it("should call POST /auth/login with the typed credentials", async () => {
    (api.post as jest.Mock).mockResolvedValue({
      data: { email: "recepcionista@fesf.gov.br", perfil: "recepcionista" },
    });

    render(<LoginPage />);
    await userEvent.type(
      screen.getByLabelText(/e-mail/i),
      "recepcionista@fesf.gov.br"
    );
    await userEvent.type(screen.getByLabelText(/senha/i), "minha_senha");
    await userEvent.click(screen.getByRole("button", { name: /entrar/i }));

    await waitFor(() =>
      expect(api.post).toHaveBeenCalledWith("/auth/login", {
        email: "recepcionista@fesf.gov.br",
        senha: "minha_senha",
      })
    );
  });
});
