import { ColumnDef } from "@tanstack/react-table";
import { ReactNode } from "react";
import { Plus, Pencil, Eye, Trash2 } from "lucide-react";

import { ConstrutorBotao, ConfiguracaoBotao } from "@/components/classes/construtor-botao";
// --- Contratos de Dados ---

// Formato esperado da resposta da API para paginação
export interface ResultadoPaginado<T> {
  data: T[];
  total: number;
}

// Filtro simples de chave/valor
export interface FiltroBusca {
  field: string;
  value: string;
}

// Definição de filtro do tipo select (dropdown com opções fixas)
export interface FiltroSelect {
  field: string;
  label: string;
  placeholder?: string;
  opcoes: Array<{ label: string; value: string }>;
}

export interface TableActions<T> {
  onAdd?: () => void;
  onEdit?: (item: T) => void;
  onView?: (item: T) => void;
  onDelete?: (item: T) => void;
}

// Agrupa os construtores dos 4 botões padrões (CRUD)
export class ConstrutorAcoesPadrao {
  public adicionar = new ConstrutorBotao("Adicionar", Plus, "default");
  public editar = new ConstrutorBotao("Editar", Pencil, "secondary");
  public visualizar = new ConstrutorBotao("Visualizar", Eye, "secondary");
  public excluir = new ConstrutorBotao("Excluir", Trash2, "destructive");
}

// Definição para botões extras/personalizados
export interface BotaoAcao {
  label: string;
  onClick: () => void;
  variant?: ConfiguracaoBotao["variant"];
  disabled?: boolean;
  icon?: ReactNode;
  tooltip?: string;
}

// --- Classe Base do Controlador ---

export abstract class DataTableController<T> {
  constructor(protected actions?: TableActions<T>) {}

  // 1. Definições Obrigatórias
  // Retorna o ID único da entidade (obrigatório para seleção e ações)
  abstract getRowId(item: T): string;

  // Retorna as colunas do TanStack Table
  abstract obterColunas(): ColumnDef<T>[];

  // Retorna campos para o select de busca (Label + Value + mascara opcional)
  abstract obterCamposPesquisaveis(): { label: string; value: string; mascara?: (v: string) => string }[];

  // Busca dados na API retornando lista e total
  abstract fetchData(
    indicePagina: number,
    tamanhoPagina: number,
    filtro?: FiltroBusca,
    filtrosExtras?: Record<string, string>,
  ): Promise<ResultadoPaginado<T>>;

  // Filtros do tipo select renderizados na toolbar (auto-aplicados)
  obterFiltrosSelect(): FiltroSelect[] {
    return [];
  }

  // 2. Configuração de Botões Padrão (Opcional)

  // Hook para personalizar os botões padrão (ex: mudar ícone, esconder 'excluir')
  configurarAcoesPadrao(builder: ConstrutorAcoesPadrao): void {
    // Implementação padrão vazia (mantém original)
  }

  // Gera a configuração final para ser usada pela View
  getFinalStandardConfigs(): {
    add: ConfiguracaoBotao;
    edit: ConfiguracaoBotao;
    view: ConfiguracaoBotao;
    delete: ConfiguracaoBotao;
  } {
    const builder = new ConstrutorAcoesPadrao();

    this.configurarAcoesPadrao(builder);

    return {
      add: builder.adicionar.obterConfiguracao(),
      edit: builder.editar.obterConfiguracao(),
      view: builder.visualizar.obterConfiguracao(),
      delete: builder.excluir.obterConfiguracao(),
    };
  }

  // 3. Ações do Usuário
  aoClicarAdicionar(): void {
    if (this.actions?.onAdd) {
      this.actions.onAdd();
    } else {
      console.warn("Ação onAdd não definida no controller.");
    }
  }

  aoClicarEditar(item: T): void {
    if (this.actions?.onEdit) {
      this.actions.onEdit(item);
    } else {
      console.warn("Ação onEdit não definida no controller.");
    }
  }

  aoClicarVisualizar(item: T): void {
    if (this.actions?.onView) {
      this.actions.onView(item);
    } else {
      console.warn("Ação onView não definida no controller.");
    }
  }

  aoClicarExcluir(item: T): void {
    if (this.actions?.onDelete) {
      this.actions.onDelete(item);
    } else {
      console.warn("Ação onDelete não definida no controller.");
    }
  }

  // 4. Ações Extras
  // Lista de botões além do CRUD (ex: Exportar, Baixar PDF)
  obterAcoesPersonalizadas(itemSelecionado: T | null): BotaoAcao[] {
    return [];
  }

  /**
   * Centraliza o tratamento de erros de API.
   * Pode ser sobrescrito se um controlador precisar de um tratamento específico.
   */
  protected async tratarErro(
    response: Response,
    mensagemPadrao: string = "Erro na requisição",
  ) {
    const errorData = await response.json().catch(() => null);

    const erro = new Error(
      errorData?.msg || errorData?.message || mensagemPadrao,
    );

    // Enriquece o erro com dados da API
    (erro as any).titulo = errorData?.titulo;
    (erro as any).code = errorData?.code;
    (erro as any).statusCode = errorData?.code;
    (erro as any).msg = errorData?.msg;

    // Dispara o erro para ser capturado pelo Hook ou pela View
    throw erro;
  }
}
