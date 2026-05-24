"use client";

import { useState, useCallback, useMemo } from "react";

import api from "@/lib/api/axios";
import { DataTablePage } from "@/components/components/data-table-page";
import { useDataTablePage } from "@/hooks/use-data-table-page";
import DialogDefault from "@/components/components/dialog-default";
import { PacientesController } from "./pacientes.controller";
import { PacienteForm } from "./_lib/PacienteForm";
import { useCadastrarPaciente } from "./_lib/use-cadastrar-paciente";
import { useEditarPaciente } from "./_lib/use-editar-paciente";
import { useExcluirPaciente } from "./_lib/use-excluir-paciente";
import type { Paciente } from "./_lib/schema";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { formatarCpf, formatarData } from "@/lib/utils/formatters";

type DialogTipo = "add" | "edit" | "view" | "delete" | null;

const FORM_ID_CRIAR  = "form-criar-paciente";
const FORM_ID_EDITAR = "form-editar-paciente";

export default function PacientesPage() {
  const [dialogAberto, setDialogAberto] = useState<DialogTipo>(null);
  const [pacienteAtivo, setPacienteAtivo] = useState<Paciente | null>(null);
  const [recarregar, setRecarregar] = useState(0);

  const fecharDialog = useCallback(() => {
    setDialogAberto(null);
    setPacienteAtivo(null);
    criar.limparErro();
    editar.limparErro();
    excluir.limparErro();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onSuccess = useCallback(() => {
    fecharDialog();
    setRecarregar((n) => n + 1);
  }, [fecharDialog]);

  const criar  = useCadastrarPaciente({ onSuccess });
  const editar = useEditarPaciente({ onSuccess });
  const excluir = useExcluirPaciente({ onSuccess });

  const abrirAdicionar = useCallback(() => setDialogAberto("add"), []);

  const abrirEditar = useCallback(async (p: Paciente) => {
    setDialogAberto("edit");
    try {
      const { data } = await api.get<Paciente>(`/pacientes/${p.id}`);
      editar.popular(data);
    } catch {
      editar.popular(p);
    }
  }, [editar]);

  const abrirVisualizar = useCallback(async (p: Paciente) => {
    setDialogAberto("view");
    try {
      const { data } = await api.get<Paciente>(`/pacientes/${p.id}`);
      setPacienteAtivo(data);
    } catch {
      setPacienteAtivo(p);
    }
  }, []);

  const abrirExcluir = useCallback((p: Paciente) => {
    setPacienteAtivo(p);
    setDialogAberto("delete");
  }, []);

  const controlador = useMemo(
    () => new PacientesController({ onAdd: abrirAdicionar, onEdit: abrirEditar, onView: abrirVisualizar, onDelete: abrirExcluir }),
    [abrirAdicionar, abrirEditar, abrirVisualizar, abrirExcluir],
  );

  const state = useDataTablePage(controlador, recarregar);

  return (
    <>
      <DataTablePage controlador={controlador} titulo="Pacientes" state={state} />

      {/* Dialog: Cadastrar */}
      <DialogDefault
        title="Cadastrar Paciente"
        open={dialogAberto === "add"}
        onOpenChange={(open) => !open && fecharDialog()}
        variant="form"
        formId={FORM_ID_CRIAR}
        isSubmitting={criar.submetendo}
        submitLabel="Cadastrar"
        onCancel={fecharDialog}
      >
        {criar.erro && <ErroAlert mensagem={criar.erro} />}
        <PacienteForm form={criar.form} formId={FORM_ID_CRIAR} onSubmit={criar.onSubmit} />
      </DialogDefault>

      {/* Dialog: Editar */}
      <DialogDefault
        title="Editar Paciente"
        open={dialogAberto === "edit"}
        onOpenChange={(open) => !open && fecharDialog()}
        variant="form"
        formId={FORM_ID_EDITAR}
        isSubmitting={editar.submetendo}
        submitLabel="Salvar"
        onCancel={fecharDialog}
      >
        {editar.erro && <ErroAlert mensagem={editar.erro} />}
        <PacienteForm form={editar.form} formId={FORM_ID_EDITAR} onSubmit={editar.onSubmit} cpfReadOnly />
      </DialogDefault>

      {/* Dialog: Visualizar */}
      <DialogDefault
        title="Dados do Paciente"
        open={dialogAberto === "view"}
        onOpenChange={(open) => !open && fecharDialog()}
        variant="view"
      >
        {pacienteAtivo && <PacienteDetalhes paciente={pacienteAtivo} />}
      </DialogDefault>

      {/* Dialog: Excluir */}
      <DialogDefault
        title="Excluir Paciente"
        open={dialogAberto === "delete"}
        onOpenChange={(open) => !open && fecharDialog()}
        variant="danger"
        submitLabel="Excluir"
        isSubmitting={excluir.submetendo}
        onSubmit={() => pacienteAtivo && excluir.excluir(pacienteAtivo.id)}
      >
        {excluir.erro && <ErroAlert mensagem={excluir.erro} />}
        <p className="text-sm text-muted-foreground">
          Tem certeza que deseja excluir o paciente{" "}
          <span className="font-semibold text-foreground">{pacienteAtivo?.nome}</span>?
          {" "}Esta ação não pode ser desfeita.
        </p>
      </DialogDefault>
    </>
  );
}

function ErroAlert({ mensagem }: { mensagem: string }) {
  return (
    <Alert variant="destructive" className="mb-4">
      <AlertCircle className="h-4 w-4" />
      <AlertDescription>{mensagem}</AlertDescription>
    </Alert>
  );
}

function PacienteDetalhes({ paciente }: { paciente: Paciente }) {
  return (
    <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      {[
        { label: "Nome",               valor: paciente.nome },
        { label: "CPF",                valor: formatarCpf(paciente.cpf) },
        { label: "Data de Nascimento", valor: formatarData(paciente.data_nascimento) },
        { label: "Telefone",           valor: paciente.telefone || "—" },
        { label: "Cadastrado em",      valor: new Date(paciente.created_at).toLocaleString("pt-BR") },
        { label: "Atualizado em",      valor: new Date(paciente.updated_at).toLocaleString("pt-BR") },
      ].map(({ label, valor }) => (
        <div key={label}>
          <dt className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{label}</dt>
          <dd className="mt-1 text-sm font-medium">{valor}</dd>
        </div>
      ))}
    </dl>
  );
}
