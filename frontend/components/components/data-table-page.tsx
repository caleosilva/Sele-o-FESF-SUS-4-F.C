"use client"

import React, { useMemo, useEffect } from "react"
import { usePageTitle } from "@/contexts/page-title-context"
import { useDataTablePage } from "@/hooks/use-data-table-page"
import { DataTable } from "@/components/components/data-table"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Search, XCircle, AlertCircle } from "lucide-react"
import { ColumnDef } from "@tanstack/react-table"
import {
  DataTableController,
  FiltroSelect,
} from "@/components/classes/data-table-controller"
import { ConfiguracaoBotao } from "@/components/classes/construtor-botao"

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

// Helper para renderizar (Ícone + Texto) ou (Só Ícone) ou (Só Texto)
const RenderButtonContent = ({ config }: { config: ConfiguracaoBotao }) => {
  const Icon = config.icon
  return (
    <>
      {Icon && <Icon className="h-4 w-4" />}
      {Icon && config.label && <span className="ml-2">{config.label}</span>}
      {!Icon && config.label}
    </>
  )
}

export function DataTablePage<T>({
  controlador,
  titulo,
  state,
}: {
  controlador: DataTableController<T>
  titulo: string
  state: ReturnType<typeof useDataTablePage<T>>
}) {
  const { setTitulo } = usePageTitle()

  useEffect(() => {
    if (!titulo) return
    setTitulo(titulo)
    return () => setTitulo("")
  }, [titulo, setTitulo])

  const botoesPadrao = useMemo(
    () => controlador.getFinalStandardConfigs(),
    [controlador]
  )

  const acoesExtras = useMemo(
    () => controlador.obterAcoesPersonalizadas(state.itemUnicoSelecionado),
    [controlador, state.itemUnicoSelecionado]
  )

  // Colunas memorizadas com checkbox
  const colunasComSelecao = useMemo<ColumnDef<T>[]>(
    () => [
      {
        id: "select",
        header: ({ table }) => (
          <Checkbox
            checked={table.getIsAllPageRowsSelected()}
            onCheckedChange={(val) => table.toggleAllPageRowsSelected(!!val)}
          />
        ),
        cell: ({ row }) => (
          <Checkbox
            checked={row.getIsSelected()}
            onCheckedChange={(val) => row.toggleSelected(!!val)}
            onClick={(e) => e.stopPropagation()}
          />
        ),
        size: 40,
        minSize: 40,
        maxSize: 40,
        enableResizing: false,
      },
      ...controlador.obterColunas(),
    ],
    [controlador]
  )

  return (
    <div className="animate-in space-y-6 p-4 duration-500 fade-in sm:p-8">
      <div className="flex flex-col gap-4">
        {/* --- BARRA DE AÇÕES (TOOLBAR) --- */}
        <div className="flex flex-wrap items-center gap-2 border-b pb-4">
          {/* 1. Botão Adicionar */}
          {botoesPadrao.add.visible && (
            <Button
              onClick={() => controlador.aoClicarAdicionar()}
              variant={botoesPadrao.add.variant || "default"}
              disabled={botoesPadrao.add.disabled}
              title={botoesPadrao.add.tooltip}
            >
              <RenderButtonContent config={botoesPadrao.add} />
            </Button>
          )}

          {/* Separador: Aparece se tiver Adicionar E (Editar OU Visualizar OU Excluir) */}
          {botoesPadrao.add.visible &&
            (botoesPadrao.edit.visible ||
              botoesPadrao.view.visible ||
              botoesPadrao.delete.visible) && (
              <div className="mx-2 h-6 w-px bg-border" />
            )}

          {/* 3. Botão Visualizar */}
          {botoesPadrao.view.visible && (
            <Button
              disabled={
                !state.itemUnicoSelecionado || botoesPadrao.view.disabled
              }
              onClick={() =>
                controlador.aoClicarVisualizar(state.itemUnicoSelecionado!)
              }
              variant={botoesPadrao.view.variant || "secondary"}
              title={botoesPadrao.view.tooltip}
            >
              <RenderButtonContent config={botoesPadrao.view} />
            </Button>
          )}

          {/* 2. Botão Editar */}
          {botoesPadrao.edit.visible && (
            <Button
              disabled={
                !state.itemUnicoSelecionado || botoesPadrao.edit.disabled
              }
              onClick={() =>
                controlador.aoClicarEditar(state.itemUnicoSelecionado!)
              }
              variant={botoesPadrao.edit.variant || "outline"}
              title={botoesPadrao.edit.tooltip}
            >
              <RenderButtonContent config={botoesPadrao.edit} />
            </Button>
          )}

          {/* 4. Botão Excluir */}
          {botoesPadrao.delete.visible && (
            <Button
              disabled={!state.existeSelecao || botoesPadrao.delete.disabled}
              onClick={() =>
                controlador.aoClicarExcluir(state.itemUnicoSelecionado!)
              }
              variant={botoesPadrao.delete.variant || "destructive"}
              title={botoesPadrao.delete.tooltip}
            >
              <RenderButtonContent config={botoesPadrao.delete} />
            </Button>
          )}

          {/* Separador: Só mostra se houver algum botão padrão visível E botões extras */}
          {(botoesPadrao.add.visible ||
            botoesPadrao.edit.visible ||
            botoesPadrao.view.visible ||
            botoesPadrao.delete.visible) &&
            acoesExtras.length > 0 && (
              <div className="mx-2 h-6 w-px bg-border" />
            )}

          {/* Ações Personalizadas */}
          {acoesExtras.map((acao, index) => (
            <Button
              key={`${acao.label}-${index}`}
              onClick={acao.onClick}
              variant={acao.variant || "secondary"}
              disabled={acao.disabled}
              title={acao.tooltip}
            >
              {acao.icon && (
                <span className={acao.label ? "mr-2" : ""}>{acao.icon}</span>
              )}
              {acao.label}
            </Button>
          ))}
        </div>

        {/* Barra de Busca */}
        <div className="flex flex-col gap-2 rounded-lg border bg-muted/30 p-3 sm:p-4">
          {/* Filtros do tipo select (auto-aplicados) */}
          {controlador.obterFiltrosSelect().length > 0 && (
            <div className="flex flex-wrap gap-2">
              {controlador.obterFiltrosSelect().map((filtro: FiltroSelect) => (
                <Select
                  key={filtro.field}
                  value={state.filtrosExtras[filtro.field] ?? "__all__"}
                  onValueChange={(val) =>
                    state.setFiltroExtra(
                      filtro.field,
                      val === "__all__" ? "" : val
                    )
                  }
                >
                  <SelectTrigger className="w-full bg-background sm:w-[200px]">
                    <SelectValue
                      placeholder={filtro.placeholder ?? filtro.label}
                    />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="__all__">
                      {filtro.placeholder ?? "Todos"}
                    </SelectItem>
                    {filtro.opcoes.map((op) => (
                      <SelectItem key={op.value} value={op.value}>
                        {op.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ))}
            </div>
          )}

          {/* Campo de texto + botão */}
          <div className="flex flex-col items-stretch gap-2 sm:flex-row sm:items-center">
            <Select
              value={state.campoBuscaSelecionado}
              onValueChange={(val) => {
                state.setCampoBuscaSelecionado(val)
                state.setTextoBuscaDigitado("")
              }}
            >
              <SelectTrigger className="w-full bg-background sm:w-[180px]">
                <SelectValue placeholder="Campo" />
              </SelectTrigger>
              <SelectContent>
                {controlador.obterCamposPesquisaveis().map((f) => (
                  <SelectItem key={f.value} value={f.value}>
                    {f.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <div className="flex w-full items-center gap-2 sm:flex-1">
              <Input
                placeholder="Digite sua busca..."
                value={state.textoBuscaDigitado}
                onChange={(e) => {
                  const campo = controlador
                    .obterCamposPesquisaveis()
                    .find((f) => f.value === state.campoBuscaSelecionado)
                  const valor = campo?.mascara
                    ? campo.mascara(e.target.value)
                    : e.target.value
                  state.setTextoBuscaDigitado(valor)
                }}
                onKeyDown={(e) =>
                  e.key === "Enter" && state.aplicarFiltroDeBusca()
                }
                className="bg-background"
              />
              <Button onClick={state.aplicarFiltroDeBusca} className="shrink-0">
                <Search className="h-4 w-4 sm:mr-2" />
                <span className="hidden sm:inline">Buscar</span>
              </Button>
              {(state.filtroAtivo ||
                Object.keys(state.filtrosExtras).length > 0) && (
                <Button variant="ghost" size="icon" onClick={state.limparBusca}>
                  <XCircle className="h-4 w-4 text-muted-foreground" />
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      <DataTable
        colunas={colunasComSelecao}
        dados={state.dados}
        estaCarregando={state.estaCarregando}
        totalDePaginas={Math.ceil(
          state.totalRegistros / state.paginacao.pageSize
        )}
        paginacao={state.paginacao}
        aoMudarPaginacao={state.setPaginacao}
        selecaoLinhas={state.selecaoLinhas}
        aoMudarSelecaoLinhas={state.setSelecaoLinhas}
        getRowId={(item) => controlador.getRowId(item)}
        permitirSelecao
        permitirSelecaoMultipla={false}
        itensPorPagina={state.paginacao.pageSize}
      />

      <AlertDialog
        open={!!state.erroAtivo}
        onOpenChange={() => state.setErroAtivo(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertCircle /> {state.erroAtivo?.titulo}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {state.erroAtivo?.msg}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction onClick={() => state.setErroAtivo(null)}>
              Entendido
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
