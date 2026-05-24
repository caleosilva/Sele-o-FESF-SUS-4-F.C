import { ElementType } from "react";

export interface ConfiguracaoBotao {
  label?: string | null; // Se null, mostra apenas ícone
  icon?: ElementType | null; // Se null, mostra apenas texto
  visible: boolean;
  variant?:
    | "default"
    | "destructive"
    | "outline"
    | "secondary"
    | "ghost"
    | "link";
  disabled?: boolean;
  tooltip?: string;
}

export class ConstrutorBotao {
  private config: ConfiguracaoBotao;

  constructor(
    rotuloPadrao: string,
    iconePadrao: ElementType | null,
    variantePadrao: ConfiguracaoBotao["variant"] = "secondary",
  ) {
    this.config = {
      label: rotuloPadrao,
      icon: iconePadrao,
      visible: true,
      variant: variantePadrao,
      disabled: false,
      tooltip: rotuloPadrao,
    };
  }

  setRotulo(rotulo: string | null): this {
    this.config.label = rotulo;
    return this;
  }

  setIcone(icone: ElementType | null): this {
    this.config.icon = icone;
    return this;
  }

  setVariante(variante: ConfiguracaoBotao["variant"]): this {
    this.config.variant = variante;
    return this;
  }

  setVisivel(visivel: boolean): this {
    this.config.visible = visivel;
    return this;
  }

  setDesabilitado(desabilitado: boolean): this {
    this.config.disabled = desabilitado;
    return this;
  }

  setTooltip(texto: string): this {
    this.config.tooltip = texto;
    return this;
  }

  obterConfiguracao(): ConfiguracaoBotao {
    return this.config;
  }
}
