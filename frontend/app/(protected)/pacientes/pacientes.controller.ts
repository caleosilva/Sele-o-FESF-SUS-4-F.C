import { ColumnDef } from "@tanstack/react-table";
import {
  DataTableController,
  FiltroBusca,
  ResultadoPaginado,
} from "@/components/classes/data-table-controller";
import { Paciente } from "./_lib/schema";
import api from "@/lib/api/axios";
import { formatarCpf, formatarCpfInput, formatarData } from "@/lib/utils/formatters";

export class PacientesController extends DataTableController<Paciente> {
  getRowId(item: Paciente): string {
    return item.id.toString();
  }

  obterColunas(): ColumnDef<Paciente>[] {
    return [
      {
        accessorKey: "nome",
        header: "Nome",
      },
      {
        accessorKey: "cpf",
        header: "CPF",
        cell: ({ row }) => formatarCpf(row.original.cpf),
      },
      {
        accessorKey: "data_nascimento",
        header: "Data de Nasc.",
        cell: ({ row }) => formatarData(row.original.data_nascimento),
      },
      {
        accessorKey: "telefone",
        header: "Telefone",
        cell: ({ row }) => row.original.telefone || "—",
      },
    ];
  }

  obterCamposPesquisaveis(): {
    label: string;
    value: string;
    mascara?: (v: string) => string;
  }[] {
    return [
      { label: "Nome", value: "nome" },
      {
        label: "CPF",
        value: "cpf",
        mascara: formatarCpfInput,
      },
    ];
  }

  async fetchData(
    indicePagina: number,
    tamanhoPagina: number,
    filtro?: FiltroBusca,
  ): Promise<ResultadoPaginado<Paciente>> {
    const params: Record<string, unknown> = {
      skip: indicePagina * tamanhoPagina,
      limit: tamanhoPagina,
    };
    if (filtro?.field && filtro?.value) {
      params.campo = filtro.field;
      params.busca =
        filtro.field === "cpf"
          ? filtro.value.replace(/\D/g, "")
          : filtro.value;
    }
    const { data } = await api.get<{ data: Paciente[]; total: number }>(
      "/pacientes/",
      { params },
    );
    return data;
  }
}
