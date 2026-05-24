"use client";

import * as React from "react";
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
  PaginationState,
  RowSelectionState,
  Table as InstanciaTabelaReact,
} from "@tanstack/react-table";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  Loader2,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";

// --- CONFIGURAÇÃO ---
const ITENS_POR_PAGINA_PADRAO = 14;

// --- TIPAGEM ---
interface PropsTabelaDeDados<TDados, TValor> {
  // Essenciais
  colunas: ColumnDef<TDados, TValor>[];
  dados: TDados[];

  // Paginação
  totalDePaginas: number;
  paginacao: PaginationState;
  aoMudarPaginacao: (paginacao: PaginationState) => void;
  itensPorPagina?: number;

  // Seleção (opcional)
  selecaoLinhas?: RowSelectionState;
  aoMudarSelecaoLinhas?: (selecao: RowSelectionState) => void;
  permitirSelecao?: boolean;
  permitirSelecaoMultipla?: boolean;
  aoClicarLinha?: (linha: TDados) => void;

  // Estados
  estaCarregando: boolean;
  erro?: string | null;

  // Customização
  mensagens?: {
    carregando?: string;
    semDados?: string;
  };
  classNameContainer?: string;
  classNameTabela?: string;

  getRowId: (item: TDados) => string;
}

// --- COMPONENTE PRINCIPAL ---
export function DataTable<TDados, TValor>({
  colunas,
  dados,
  totalDePaginas,
  paginacao,
  aoMudarPaginacao,
  itensPorPagina = ITENS_POR_PAGINA_PADRAO,
  selecaoLinhas = {},
  aoMudarSelecaoLinhas,
  permitirSelecao = false,
  permitirSelecaoMultipla = false,
  aoClicarLinha,
  estaCarregando,
  erro,
  mensagens,
  classNameContainer,
  classNameTabela,
  getRowId,
}: PropsTabelaDeDados<TDados, TValor>) {
  // Inicializa a instância do TanStack Table
  const tabela = useReactTable({
    data: dados,
    columns: colunas,
    pageCount: totalDePaginas,
    getRowId,
    state: {
      pagination: { ...paginacao, pageSize: itensPorPagina },
      rowSelection: selecaoLinhas,
    },
    manualPagination: true,
    enableRowSelection: permitirSelecao,
    enableMultiRowSelection: permitirSelecaoMultipla,
    getCoreRowModel: getCoreRowModel(),

    // Wrappers para converter o estado da lib para o estado do React
    onPaginationChange: (atualizador) => {
      const proximoEstado =
        typeof atualizador === "function"
          ? atualizador({ ...paginacao, pageSize: itensPorPagina })
          : atualizador;
      aoMudarPaginacao(proximoEstado);
    },
    onRowSelectionChange: (atualizador) => {
      if (!aoMudarSelecaoLinhas) return;

      const proximaSelecao =
        typeof atualizador === "function"
          ? atualizador(selecaoLinhas)
          : atualizador;
      aoMudarSelecaoLinhas(proximaSelecao);
    },
  });

  return (
    <div className={`space-y-4 ${classNameContainer || ""}`}>
      <div
        className={`rounded-md border overflow-x-auto ${classNameTabela || ""}`}
      >
        <Table>
          <TableHeader>
            {tabela.getHeaderGroups().map((grupoCabecalho) => (
              <TableRow key={grupoCabecalho.id}>
                {grupoCabecalho.headers.map((cabecalho) => (
                  <TableHead key={cabecalho.id}>
                    {cabecalho.isPlaceholder
                      ? null
                      : flexRender(
                          cabecalho.column.columnDef.header,
                          cabecalho.getContext(),
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>

          <TableBody>
            {renderizarConteudoTabela(
              tabela,
              colunas.length,
              estaCarregando,
              erro,
              mensagens,
              permitirSelecao,
              aoClicarLinha,
            )}
          </TableBody>
        </Table>
      </div>

      {/* Paginação */}
      <ControleDePaginacao tabela={tabela} />
    </div>
  );
}

// --- FUNÇÕES E COMPONENTES AUXILIARES ---

/**
 * Decide o conteúdo do corpo da tabela: Erro, Carregando, Vazio ou Lista.
 */
function renderizarConteudoTabela<TDados>(
  tabela: InstanciaTabelaReact<TDados>,
  quantidadeColunas: number,
  estaCarregando: boolean,
  erro?: string | null,
  mensagens?: { carregando?: string; semDados?: string },
  permitirSelecao?: boolean,
  aoClicarLinha?: (linha: TDados) => void,
) {
  // Estado de erro
  if (erro) {
    return (
      <TableRow>
        <TableCell
          colSpan={quantidadeColunas}
          className="h-24 text-center text-red-500"
        >
          <div className="flex justify-center items-center gap-2">
            <span>⚠️ {erro}</span>
          </div>
        </TableCell>
      </TableRow>
    );
  }

  // Estado de carregamento
  if (estaCarregando) {
    return (
      <TableRow>
        <TableCell colSpan={quantidadeColunas} className="h-24 text-center">
          <div className="flex justify-center items-center gap-2">
            <Loader2 className="h-6 w-6 animate-spin" />
            <span>{mensagens?.carregando || "Carregando dados..."}</span>
          </div>
        </TableCell>
      </TableRow>
    );
  }

  // Estado vazio
  if (tabela.getRowModel().rows.length === 0) {
    return (
      <TableRow>
        <TableCell
          colSpan={quantidadeColunas}
          className="h-24 text-center text-muted-foreground"
        >
          {mensagens?.semDados || "Nenhum registro encontrado."}
        </TableCell>
      </TableRow>
    );
  }

  // Lista de dados
  return tabela.getRowModel().rows.map((linha) => (
    <TableRow
      key={linha.id}
      data-state={linha.getIsSelected() && "selected"}
      onClick={() => {
        if (permitirSelecao) {
          linha.toggleSelected();
        }
        if (aoClicarLinha) {
          aoClicarLinha(linha.original);
        }
      }}
      className={permitirSelecao || aoClicarLinha ? "cursor-pointer" : ""}
    >
      {linha.getVisibleCells().map((celula) => (
        <TableCell key={celula.id}>
          {flexRender(celula.column.columnDef.cell, celula.getContext())}
        </TableCell>
      ))}
    </TableRow>
  ));
}

/**
 * Componente visual para os botões de navegação.
 */
function ControleDePaginacao<TDados>({
  tabela,
}: {
  tabela: InstanciaTabelaReact<TDados>;
}) {
  return (
    <div className="flex items-center justify-end gap-2">
      <div className="flex items-center space-x-2">
        {/* Ir para Primeira Página */}
        <Button
          variant="outline"
          className="h-8 w-8 p-0"
          onClick={() => tabela.setPageIndex(0)}
          disabled={!tabela.getCanPreviousPage()}
          aria-label="Primeira página"
        >
          <ChevronsLeft className="h-4 w-4" />
        </Button>

        {/* Página Anterior */}
        <Button
          variant="outline"
          className="h-8 w-8 p-0"
          onClick={() => tabela.previousPage()}
          disabled={!tabela.getCanPreviousPage()}
          aria-label="Página anterior"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>

        <span className="text-sm font-medium">
          Pag {tabela.getState().pagination.pageIndex + 1} de{" "}
          {tabela.getPageCount() || 1}
        </span>

        {/* Próxima Página */}
        <Button
          variant="outline"
          className="h-8 w-8 p-0"
          onClick={() => tabela.nextPage()}
          disabled={!tabela.getCanNextPage()}
          aria-label="Próxima página"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>

        {/* Ir para Última Página */}
        <Button
          variant="outline"
          className="h-8 w-8 p-0"
          onClick={() => tabela.setPageIndex(tabela.getPageCount() - 1)}
          disabled={!tabela.getCanNextPage()}
          aria-label="Última página"
        >
          <ChevronsRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
