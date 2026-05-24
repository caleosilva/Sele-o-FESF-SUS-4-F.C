import {
  BotaoAcao
} from "@/components/classes/data-table-controller";
import { ReactNode } from "react";

export class ConstrutorAcaoPersonalizada {
  private acao: BotaoAcao;

  constructor(rotulo: string) {
    // Valores padrão iniciais
    this.acao = {
      label: rotulo,
      onClick: () => {},
      variant: "secondary",
      disabled: false,
      visible: true
    } as any;
  }

  /** Define a função executada ao clicar. */
  aoClicar(funcao: () => void): this {
    this.acao.onClick = funcao;
    return this;
  }

  /** Define um ícone para o botão. */
  definirIcone(icone: ReactNode): this {
    this.acao.icon = icone;
    return this;
  }

  /** Define a variante visual (cor/estilo). */
  definirVariante(variante: BotaoAcao['variant']): this {
    this.acao.variant = variante;
    return this;
  }

  /** Define se o botão está desabilitado. Aceita booleano ou condição. */
  desabilitar(condicao: boolean = true): this {
    this.acao.disabled = condicao;
    return this;
  }

  /** Define um texto de ajuda (tooltip). */
  definirTooltip(texto: string): this {
    this.acao.tooltip = texto;
    return this;
  }

  /** Finaliza a construção e retorna o objeto pronto. */
  construir(): BotaoAcao {
    return this.acao;
  }
}