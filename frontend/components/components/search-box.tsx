"use client";

import React, { useState, useMemo, useCallback, useEffect } from "react";
import { RowSelectionState } from "@tanstack/react-table";
import {
  DataTableController,
  FiltroBusca,
} from "@/components/classes/data-table-controller";
import { DataTable } from "@/components/components/data-table";
import DialogDefault from "@/components/components/dialog-default";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, XCircle, Plus, ChevronDown } from "lucide-react";

const PAGE_SIZE = 8;

interface SearchBoxProps<T> {
  controlador: DataTableController<T>;
  value: T | null;
  onChange: (item: T | null) => void;
  renderLabel: (item: T) => string;
  label?: string;
  titulo?: string;
  placeholder?: string;
  permitirCadastro?: boolean;
  onCadastrar?: () => void;
  labelCadastrar?: string;
  disabled?: boolean;
  obrigatorio?: boolean;
}

export function SearchBox<T>({
  controlador,
  value,
  onChange,
  renderLabel,
  label,
  titulo = "Selecionar",
  placeholder = "Selecionar...",
  permitirCadastro = false,
  onCadastrar,
  labelCadastrar = "Novo",
  disabled = false,
  obrigatorio = false,
}: SearchBoxProps<T>) {
  const [dialogAberto, setDialogAberto] = useState(false);
  const [dados, setDados] = useState<T[]>([]);
  const [estaCarregando, setEstaCarregando] = useState(false);
  const [totalRegistros, setTotalRegistros] = useState(0);
  const [paginacao, setPaginacao] = useState({
    pageIndex: 0,
    pageSize: PAGE_SIZE,
  });
  const [selecaoLinhas, setSelecaoLinhas] = useState<RowSelectionState>({});
  const [textoBusca, setTextoBusca] = useState("");
  const [campoBusca, setCampoBusca] = useState(
    () => controlador.obterCamposPesquisaveis()[0]?.value || "",
  );
  const [filtroAtivo, setFiltroAtivo] = useState<FiltroBusca | undefined>(
    undefined,
  );
  const [forcarRecarga, setForcarRecarga] = useState(0);

  const camposPesquisaveis = useMemo(
    () => controlador.obterCamposPesquisaveis(),
    [controlador],
  );

  const colunas = useMemo(() => controlador.obterColunas(), [controlador]);

  const buscarDados = useCallback(async () => {
    setEstaCarregando(true);
    try {
      const resultado = await controlador.fetchData(
        paginacao.pageIndex,
        PAGE_SIZE,
        filtroAtivo,
      );
      setDados(resultado.data);
      setTotalRegistros(resultado.total);
    } catch {
      setDados([]);
      setTotalRegistros(0);
    } finally {
      setEstaCarregando(false);
    }
  }, [controlador, paginacao.pageIndex, filtroAtivo]);

  useEffect(() => {
    if (!dialogAberto) return;
    buscarDados();
  }, [buscarDados, forcarRecarga]);

  function abrirDialog() {
    setTextoBusca("");
    setCampoBusca(camposPesquisaveis[0]?.value || "");
    setSelecaoLinhas({});
    setFiltroAtivo(undefined);
    setPaginacao({ pageIndex: 0, pageSize: PAGE_SIZE });
    setForcarRecarga((v) => v + 1);
    setDialogAberto(true);
  }

  function aplicarBusca() {
    setPaginacao((prev) => ({ ...prev, pageIndex: 0 }));
    setSelecaoLinhas({});
    if (textoBusca.trim()) {
      setFiltroAtivo({ field: campoBusca, value: textoBusca.trim() });
    } else {
      setFiltroAtivo(undefined);
    }
  }

  function limparBusca() {
    setTextoBusca("");
    setFiltroAtivo(undefined);
    setPaginacao((prev) => ({ ...prev, pageIndex: 0 }));
  }

  function aoClicarLinha(item: T) {
    onChange(item);
    setDialogAberto(false);
  }

  function handleLimparSelecao(e: React.MouseEvent) {
    e.stopPropagation();
    onChange(null);
  }

  return (
    <>
      <div className="flex flex-col gap-1">
        {label && (
          <span className="text-xs font-medium">
            {label}
            {obrigatorio && <span className="text-destructive ml-0.5">*</span>}
          </span>
        )}
        <div className="flex items-center gap-1">
          <Button
            type="button"
            variant="outline"
            className="flex-1 justify-between font-normal bg-background min-w-0"
            onClick={() => !disabled && abrirDialog()}
            disabled={disabled}
          >
            <span
              className={`truncate ${value ? "" : "text-muted-foreground"}`}
            >
              {value ? renderLabel(value) : placeholder}
            </span>
            <ChevronDown className="h-4 w-4 text-muted-foreground shrink-0 ml-2" />
          </Button>
          {value && !disabled && (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="shrink-0"
              onClick={handleLimparSelecao}
            >
              <XCircle className="h-4 w-4 text-muted-foreground" />
            </Button>
          )}
        </div>
      </div>

      <DialogDefault
        title={titulo}
        open={dialogAberto}
        onOpenChange={setDialogAberto}
        variant="view"
        contentClassName="sm:max-w-[1100px]"
      >
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
            {camposPesquisaveis.length > 1 ? (
              <Select value={campoBusca} onValueChange={setCampoBusca}>
                <SelectTrigger className="w-full sm:w-[160px] bg-background">
                  <SelectValue placeholder="Campo" />
                </SelectTrigger>
                <SelectContent>
                  {camposPesquisaveis.map((f) => (
                    <SelectItem key={f.value} value={f.value}>
                      {f.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : camposPesquisaveis.length === 1 ? (
              <span className="text-sm text-muted-foreground shrink-0 sm:w-[160px]">
                {camposPesquisaveis[0].label}
              </span>
            ) : null}

            <div className="flex flex-1 items-center gap-2">
              <Input
                placeholder="Buscar..."
                value={textoBusca}
                onChange={(e) => setTextoBusca(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && aplicarBusca()}
                className="bg-background"
              />
              <Button type="button" onClick={aplicarBusca} className="shrink-0">
                <Search className="h-4 w-4" />
              </Button>
              {filtroAtivo && (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={limparBusca}
                >
                  <XCircle className="h-4 w-4 text-muted-foreground" />
                </Button>
              )}
            </div>

            {permitirCadastro && (
              <Button
                type="button"
                variant="secondary"
                className="shrink-0"
                onClick={() => {
                  setDialogAberto(false);
                  onCadastrar?.();
                }}
              >
                <Plus className="h-4 w-4 mr-1" />
                {labelCadastrar}
              </Button>
            )}
          </div>

          <div className="overflow-x-auto">
            <DataTable
              colunas={colunas}
              dados={dados}
              estaCarregando={estaCarregando}
              totalDePaginas={Math.ceil(totalRegistros / PAGE_SIZE) || 1}
              paginacao={paginacao}
              aoMudarPaginacao={setPaginacao}
              selecaoLinhas={selecaoLinhas}
              aoMudarSelecaoLinhas={setSelecaoLinhas}
              getRowId={(item) => controlador.getRowId(item)}
              aoClicarLinha={aoClicarLinha}
              itensPorPagina={PAGE_SIZE}
            />
          </div>
        </div>
      </DialogDefault>
    </>
  );
}
