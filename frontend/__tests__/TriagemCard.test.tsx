/**
 * Testes do componente TriagemCard.
 *
 * Verifica renderização de nome, CPF formatado, badge de cor e queixa principal
 * para todos os quatro níveis de risco do protocolo Manchester.
 */

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
  it("should render patient name", () => {
    render(<TriagemCard triagem={BASE_TRIAGEM} />);
    expect(screen.getByText("João Silva")).toBeInTheDocument();
  });

  it("should render formatted CPF with mask", () => {
    render(<TriagemCard triagem={BASE_TRIAGEM} />);
    expect(screen.getByText(/123\.456\.789-01/)).toBeInTheDocument();
  });

  it("should render the main complaint text", () => {
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
    "should render correct short label '%s' in the badge for risk color %s",
    (cor_risco, expectedLabel) => {
      render(<TriagemCard triagem={{ ...BASE_TRIAGEM, cor_risco }} />);
      expect(screen.getByText(expectedLabel)).toBeInTheDocument();
    }
  );

  it("should render arrival time from created_at", () => {
    render(<TriagemCard triagem={BASE_TRIAGEM} />);
    // Verifica que algum texto de chegada está presente (formato varia por locale)
    expect(screen.getByText(/chegada/i)).toBeInTheDocument();
  });
});
