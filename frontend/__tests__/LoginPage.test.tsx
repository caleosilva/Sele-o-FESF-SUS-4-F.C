/**
 * Testes do componente LoginPage (app/login/page.tsx).
 *
 * Mocka o axios, o store de autenticação e next/navigation para testar
 * a lógica do componente de forma isolada.
 */

import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import LoginPage from "@/app/login/page";
import api from "@/lib/api/axios";
import { useAuthStore } from "@/store/authStore";
import { mockAuthStore } from "./helpers/mockStore";

jest.mock("@/lib/api/axios", () => ({
  post: jest.fn(),
}));

jest.mock("@/store/authStore");

const mockPush = jest.fn();
jest.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush }),
}));

const mockLogin = jest.fn();

beforeEach(() => {
  jest.clearAllMocks();
  (useAuthStore as jest.Mock).mockImplementation((selector) =>
    selector(mockAuthStore({ login: mockLogin }))
  );
});

describe("LoginPage", () => {
  it("should render email and password input fields", () => {
    render(<LoginPage />);
    expect(screen.getByLabelText(/e-mail/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/senha/i)).toBeInTheDocument();
  });

  it("should render the submit button", () => {
    render(<LoginPage />);
    expect(screen.getByRole("button", { name: /entrar/i })).toBeInTheDocument();
  });

  it("should display an error message when credentials are invalid", async () => {
    (api.post as jest.Mock).mockRejectedValue({ response: { status: 401 } });

    render(<LoginPage />);
    await userEvent.type(screen.getByLabelText(/e-mail/i), "wrong@test.com");
    await userEvent.type(screen.getByLabelText(/senha/i), "wrongpass");
    await userEvent.click(screen.getByRole("button", { name: /entrar/i }));

    await waitFor(() =>
      expect(screen.getByText(/e-mail ou senha incorretos/i)).toBeInTheDocument()
    );
  });

  it("should call authStore.login with user data on successful authentication", async () => {
    (api.post as jest.Mock).mockResolvedValue({
      data: { email: "enfermeiro@fesf.gov.br", perfil: "enfermeiro" },
    });

    render(<LoginPage />);
    await userEvent.type(screen.getByLabelText(/e-mail/i), "enfermeiro@fesf.gov.br");
    await userEvent.type(screen.getByLabelText(/senha/i), "senha123");
    await userEvent.click(screen.getByRole("button", { name: /entrar/i }));

    await waitFor(() =>
      expect(mockLogin).toHaveBeenCalledWith({
        email: "enfermeiro@fesf.gov.br",
        perfil: "enfermeiro",
      })
    );
  });

  it("should redirect to /triagem after successful login", async () => {
    (api.post as jest.Mock).mockResolvedValue({
      data: { email: "enfermeiro@fesf.gov.br", perfil: "enfermeiro" },
    });

    render(<LoginPage />);
    await userEvent.type(screen.getByLabelText(/e-mail/i), "enfermeiro@fesf.gov.br");
    await userEvent.type(screen.getByLabelText(/senha/i), "senha123");
    await userEvent.click(screen.getByRole("button", { name: /entrar/i }));

    await waitFor(() => expect(mockPush).toHaveBeenCalledWith("/triagem"));
  });

  it("should not show error message in the initial state", () => {
    render(<LoginPage />);
    expect(screen.queryByText(/e-mail ou senha incorretos/i)).not.toBeInTheDocument();
  });
});
