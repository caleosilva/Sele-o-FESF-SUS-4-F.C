/**
 * Helpers para substituir os stores Zustand por valores controlados em testes.
 *
 * Uso:
 *   jest.mock("@/store/authStore");
 *   import { useAuthStore } from "@/store/authStore";
 *   (useAuthStore as jest.Mock).mockImplementation((selector) =>
 *     selector(mockAuthStore({ login: mockFn }))
 *   );
 */

import type { AuthState } from "@/store/authStore";
import type { TriagemState } from "@/store/triagemStore";

type PartialState<T> = Partial<{ [K in keyof T]: T[K] }>;

export function mockAuthStore(overrides: PartialState<AuthState> = {}): AuthState {
  return {
    usuario: null,
    login: jest.fn(),
    logout: jest.fn(),
    isAuthenticated: jest.fn().mockReturnValue(false),
    ...overrides,
  };
}

export function mockTriagemStore(overrides: PartialState<TriagemState> = {}): TriagemState {
  return {
    fila: [],
    setFila: jest.fn(),
    adicionarTriagem: jest.fn(),
    atualizarStatus: jest.fn(),
    limparFila: jest.fn(),
    ...overrides,
  };
}
