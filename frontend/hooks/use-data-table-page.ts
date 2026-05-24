import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { RowSelectionState } from "@tanstack/react-table";
import {
  DataTableController,
  FiltroBusca,
} from "@/components/classes/data-table-controller";

export function useDataTablePage<T>(
  controlador: DataTableController<T>,
  forcarRecarga?: boolean | number,
  initialPageSize = 14,
) {
  const [dados, setDados] = useState<T[]>([]);
  const [estaCarregando, setEstaCarregando] = useState(true);
  const [totalRegistros, setTotalRegistros] = useState(0);
  const [paginacao, setPaginacao] = useState({ pageIndex: 0, pageSize: initialPageSize });
  const [selecaoLinhas, setSelecaoLinhas] = useState<RowSelectionState>({});
  const [textoBuscaDigitado, setTextoBuscaDigitado] = useState("");
  const [campoBuscaSelecionado, setCampoBuscaSelecionado] = useState<string>(
    controlador.obterCamposPesquisaveis()[0]?.value || "",
  );
  const [filtroAtivo, setFiltroAtivo] = useState<FiltroBusca | undefined>(
    undefined,
  );
  const [filtrosExtras, setFiltrosExtras] = useState<Record<string, string>>(
    {},
  );
  const [erroAtivo, setErroAtivo] = useState<{
    titulo: string;
    msg: string;
  } | null>(null);

  const controladorRef = useRef(controlador);
  controladorRef.current = controlador;

  const buscarDados = useCallback(async () => {
    setEstaCarregando(true);
    try {
      const resultado = await controladorRef.current.fetchData(
        paginacao.pageIndex,
        paginacao.pageSize,
        filtroAtivo,
        filtrosExtras,
      );
      setDados(resultado.data);
      setTotalRegistros(resultado.total);
    } catch (erro: any) {
      if (erro.titulo && erro.msg) {
        setErroAtivo({
          titulo: erro.titulo,
          msg: erro.msg,
        });
      } else {
        setErroAtivo({
          titulo: "Erro de Carregamento",
          msg: "Não foi possível sincronizar os dados.",
        });
      }
    } finally {
      setEstaCarregando(false);
    }
  }, [paginacao.pageIndex, paginacao.pageSize, filtroAtivo, filtrosExtras]);

  useEffect(() => {
    buscarDados();
  }, [buscarDados, forcarRecarga]);

  const aplicarFiltroDeBusca = () => {
    setPaginacao((prev) => ({ ...prev, pageIndex: 0 }));
    setSelecaoLinhas({});
    if (textoBuscaDigitado.trim()) {
      setFiltroAtivo({
        field: campoBuscaSelecionado,
        value: textoBuscaDigitado,
      });
    } else {
      setFiltroAtivo(undefined);
    }
  };

  const setFiltroExtra = (field: string, value: string) => {
    setPaginacao((prev) => ({ ...prev, pageIndex: 0 }));
    setSelecaoLinhas({});
    setFiltrosExtras((prev) => {
      if (!value) {
        const next = { ...prev };
        delete next[field];
        return next;
      }
      return { ...prev, [field]: value };
    });
  };

  const limparBusca = () => {
    setTextoBuscaDigitado("");
    setFiltroAtivo(undefined);
    setFiltrosExtras({});
    setPaginacao((prev) => ({ ...prev, pageIndex: 0 }));
  };

  const itensSelecionados = useMemo(() => {
    const idsSelecionados = Object.keys(selecaoLinhas).filter(
      (id) => selecaoLinhas[id],
    );

    return dados.filter((item) =>
      idsSelecionados.includes(controlador.getRowId(item)),
    );
  }, [selecaoLinhas, dados, controlador]);

  useEffect(() => {
    setSelecaoLinhas({});
  }, [paginacao.pageIndex]);

  useEffect(() => {}, [selecaoLinhas, itensSelecionados]);

  return {
    dados,
    estaCarregando,
    totalRegistros,
    paginacao,
    setPaginacao,
    selecaoLinhas,
    setSelecaoLinhas,
    textoBuscaDigitado,
    setTextoBuscaDigitado,
    campoBuscaSelecionado,
    setCampoBuscaSelecionado,
    filtroAtivo,
    filtrosExtras,
    setFiltroExtra,
    aplicarFiltroDeBusca,
    limparBusca,
    itensSelecionados,
    itemUnicoSelecionado: (itensSelecionados.length === 1
      ? itensSelecionados[0]
      : null) as T | null,
    existeSelecao: itensSelecionados.length > 0,
    erroAtivo,
    setErroAtivo,
  };
}
