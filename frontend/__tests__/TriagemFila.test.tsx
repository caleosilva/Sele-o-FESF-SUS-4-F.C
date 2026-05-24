/**
 * Testes do comportamento da fila de triagem consumindo o store Zustand real.
 *
 * Usa useTriagemStore.setState() para controlar o estado sem mocks de módulo,
 * validando que o componente renderiza e re-renderiza corretamente.
 */

import { render, screen, act } from "@testing-library/react";
import { useTriagemStore } from "@/store/triagemStore";
import type { Triagem } from "@/store/triagemStore";

/** Componente wrapper mínimo que espelha o consumo do store na página de triagem. */
function FilaWrapper() {
  const fila = useTriagemStore((s) => s.fila);

  if (!fila.length) {
    return <p>Nenhum paciente na fila</p>;
  }

  return (
    <ul data-testid="fila-triagem">
      {fila.map((t) => (
        <li key={t.id} data-testid={`triagem-${t.id}`}>
          {t.paciente.nome} — {t.cor_risco}
        </li>
      ))}
    </ul>
  );
}

function makeTriagem(
  id: number,
  cor: Triagem["cor_risco"],
  nome: string
): Triagem {
  return {
    id,
    paciente_id: id,
    paciente: { id, nome, cpf: `${String(id).padStart(11, "0")}` },
    cor_risco: cor,
    queixa_principal: "Queixa de teste suficientemente longa para validação",
    created_at: "2024-01-15T10:00:00Z",
  };
}

beforeEach(() => {
  useTriagemStore.setState({ fila: [] });
});

describe("TriagemFila (store integration)", () => {
  it("should show empty state message when queue is empty", () => {
    render(<FilaWrapper />);
    expect(screen.getByText(/nenhum paciente na fila/i)).toBeInTheDocument();
  });

  it("should render all patients present in the store", () => {
    act(() => {
      useTriagemStore.setState({
        fila: [
          makeTriagem(1, "vermelho", "Ana Paula"),
          makeTriagem(2, "verde", "Carlos Ramos"),
        ],
      });
    });

    render(<FilaWrapper />);

    expect(screen.getByText(/Ana Paula/)).toBeInTheDocument();
    expect(screen.getByText(/Carlos Ramos/)).toBeInTheDocument();
  });

  it("should re-render the list when the store updates", () => {
    render(<FilaWrapper />);
    expect(screen.getByText(/nenhum paciente na fila/i)).toBeInTheDocument();

    act(() => {
      useTriagemStore.setState({
        fila: [makeTriagem(3, "amarelo", "Pedro Lima")],
      });
    });

    expect(screen.getByText(/Pedro Lima/)).toBeInTheDocument();
    expect(screen.queryByText(/nenhum paciente na fila/i)).not.toBeInTheDocument();
  });

  it("should display the risk color alongside each patient name", () => {
    act(() => {
      useTriagemStore.setState({
        fila: [
          makeTriagem(10, "laranja", "Maria Souza"),
        ],
      });
    });

    render(<FilaWrapper />);
    expect(screen.getByText(/laranja/i)).toBeInTheDocument();
  });

  it("should render items in the order provided by the store", () => {
    act(() => {
      useTriagemStore.setState({
        fila: [
          makeTriagem(1, "vermelho", "Primeiro"),
          makeTriagem(2, "amarelo", "Segundo"),
          makeTriagem(3, "verde", "Terceiro"),
        ],
      });
    });

    render(<FilaWrapper />);
    const items = screen.getAllByRole("listitem");
    expect(items[0]).toHaveTextContent("Primeiro");
    expect(items[1]).toHaveTextContent("Segundo");
    expect(items[2]).toHaveTextContent("Terceiro");
  });
});
