import { render, screen, act } from "@testing-library/react";
import { useTriagemStore } from "@/store/triagemStore";
import type { Triagem } from "@/store/triagemStore";

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

describe("TriagemFila (integração com store)", () => {
  it("deve exibir mensagem de fila vazia quando não há pacientes", () => {
    render(<FilaWrapper />);
    expect(screen.getByText(/nenhum paciente na fila/i)).toBeInTheDocument();
  });

  it("deve renderizar todos os pacientes presentes no store", () => {
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

  it("deve re-renderizar a lista quando o store é atualizado", () => {
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

  it("deve exibir a cor de risco ao lado do nome de cada paciente", () => {
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

  it("deve renderizar os itens na ordem fornecida pelo store", () => {
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
