import { render, screen } from "@testing-library/react";
import { TriagemCard } from "@/components/dashboard/TriagemCard";
import type { Triagem } from "@/store/triagemStore";

const BASE_TRIAGEM: Triagem = {
  id: 1,
  paciente_id: 1,
  paciente: { id: 1, nome: "João Silva", cpf: "12345678901" },
  cor_risco: "vermelho",
  queixa_principal: "Dor torácica intensa com irradiação para o braço esquerdo",
  created_at: "2024-01-15T10:30:00Z",
};

describe("TriagemCard", () => {
  it("deve renderizar o nome do paciente", () => {
    render(<TriagemCard triagem={BASE_TRIAGEM} />);
    expect(screen.getByText("João Silva")).toBeInTheDocument();
  });

  it("deve renderizar o CPF formatado com máscara", () => {
    render(<TriagemCard triagem={BASE_TRIAGEM} />);
    expect(screen.getByText(/123\.456\.789-01/)).toBeInTheDocument();
  });

  it("deve renderizar o texto da queixa principal", () => {
    render(<TriagemCard triagem={BASE_TRIAGEM} />);
    expect(
      screen.getByText("Dor torácica intensa com irradiação para o braço esquerdo")
    ).toBeInTheDocument();
  });

  it.each([
    ["vermelho", "Vermelho"],
    ["laranja", "Laranja"],
    ["amarelo", "Amarelo"],
    ["verde", "Verde"],
  ] as const)(
    "deve renderizar o rótulo '%s' correto no badge para a cor de risco %s",
    (cor_risco, expectedLabel) => {
      render(<TriagemCard triagem={{ ...BASE_TRIAGEM, cor_risco }} />);
      expect(screen.getByText(expectedLabel)).toBeInTheDocument();
    }
  );

  it("deve renderizar o horário de chegada a partir de created_at", () => {
    render(<TriagemCard triagem={BASE_TRIAGEM} />);
    expect(screen.getByText(/chegada/i)).toBeInTheDocument();
  });
});
