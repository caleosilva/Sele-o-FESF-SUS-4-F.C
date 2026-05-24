"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { RefreshCw, ClipboardList, ClipboardPlus, AlertCircle } from "lucide-react";

import api from "@/lib/api/axios";
import { useTriagemStore, type Triagem } from "@/store/triagemStore";
import { TriagemCard } from "@/components/dashboard/TriagemCard";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import DialogDefault from "@/components/components/dialog-default";
import { useCadastrarTriagem } from "./_lib/use-cadastrar-triagem";
import { TriagemForm } from "./_lib/TriagemForm";
import { COR_CONFIG } from "./_lib/cor-risco-config";

const INTERVALO_MS = 30_000;
const FORM_ID_TRIAGEM = "form-nova-triagem";

const ORDEM_COR = ["vermelho", "laranja", "amarelo", "verde"] as const;

export default function TriagemPage() {
  const { fila, setFila } = useTriagemStore();
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState("");
  const [ultimaAtualizacao, setUltimaAtualizacao] = useState<Date | null>(null);
  const [countdown, setCountdown] = useState(INTERVALO_MS / 1000);
  const [dialogAberto, setDialogAberto] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const buscarFila = useCallback(async () => {
    setCarregando(true);
    setErro("");
    try {
      const { data } = await api.get<Triagem[]>("/triagens/fila");
      setFila(data);
      setUltimaAtualizacao(new Date());
      setCountdown(INTERVALO_MS / 1000);
    } catch {
      setErro("Não foi possível carregar a fila de triagem.");
    } finally {
      setCarregando(false);
    }
  }, [setFila]);

  const onSuccess = useCallback(() => {
    setDialogAberto(false);
    buscarFila();
  }, [buscarFila]);

  const cadastrar = useCadastrarTriagem({ onSuccess });

  const fecharDialog = useCallback(() => {
    setDialogAberto(false);
    cadastrar.limparErro();
    cadastrar.resetForm();
  }, [cadastrar.limparErro, cadastrar.resetForm]);

  // Refresh automático
  useEffect(() => {
    buscarFila();
    intervalRef.current = setInterval(buscarFila, INTERVALO_MS);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [buscarFila]);

  // Contador regressivo
  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => (prev <= 1 ? INTERVALO_MS / 1000 : prev - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const porCor = ORDEM_COR.map((cor) => ({
    cor,
    pacientes: fila.filter((t) => t.cor_risco === cor),
  }));

  const totalPacientes = fila.length;

  return (
    <div className="space-y-6">
      {/* Cabeçalho */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <ClipboardList className="h-5 w-5 text-primary" />
          <div>
            <h1 className="text-xl font-bold leading-tight">Fila de Triagem</h1>
            {ultimaAtualizacao && (
              <p className="text-xs text-muted-foreground">
                Atualizado às{" "}
                {ultimaAtualizacao.toLocaleTimeString("pt-BR", {
                  hour: "2-digit",
                  minute: "2-digit",
                  second: "2-digit",
                })}
                {" — "}próxima em {countdown}s
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Badge variant="secondary">{totalPacientes} paciente{totalPacientes !== 1 ? "s" : ""}</Badge>
          <Button
            size="sm"
            variant="outline"
            onClick={buscarFila}
            disabled={carregando}
            className="gap-2"
          >
            <RefreshCw className={`h-4 w-4 ${carregando ? "animate-spin" : ""}`} />
            Atualizar
          </Button>
          <Button size="sm" className="gap-2" onClick={() => setDialogAberto(true)}>
            <ClipboardPlus className="h-4 w-4" />
            Nova Triagem
          </Button>
        </div>
      </div>

      {/* Erro de carregamento da fila */}
      {erro && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{erro}</AlertDescription>
        </Alert>
      )}

      {/* Fila por cor */}
      {fila.length === 0 && !carregando && !erro ? (
        <div className="flex flex-col items-center justify-center py-20 text-muted-foreground gap-2">
          <ClipboardList className="h-10 w-10 opacity-30" />
          <p className="text-sm">Nenhum paciente na fila no momento.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 items-start">
          {porCor.map(({ cor, pacientes }) => (
            <div key={cor} className="space-y-3">
              <div className="flex items-center gap-2">
                <span className={`inline-block h-3 w-3 rounded-full shrink-0 ${COR_CONFIG[cor].dot}`} />
                <span className="text-sm font-semibold capitalize">{cor}</span>
                <Badge variant="outline" className="ml-auto text-xs">
                  {pacientes.length}
                </Badge>
              </div>

              {pacientes.length === 0 ? (
                <p className="text-xs text-muted-foreground px-1">Sem pacientes</p>
              ) : (
                pacientes.map((t) => <TriagemCard key={t.id} triagem={t} />)
              )}
            </div>
          ))}
        </div>
      )}

      {/* Modal: Nova Triagem */}
      <DialogDefault
        title="Nova Triagem"
        open={dialogAberto}
        onOpenChange={(open) => !open && fecharDialog()}
        variant="form"
        formId={FORM_ID_TRIAGEM}
        isSubmitting={cadastrar.submetendo}
        submitLabel="Registrar"
        onCancel={fecharDialog}
      >
        {cadastrar.erro && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{cadastrar.erro}</AlertDescription>
          </Alert>
        )}
        <TriagemForm
          form={cadastrar.form}
          formId={FORM_ID_TRIAGEM}
          onSubmit={cadastrar.onSubmit}
          pacienteEncontrado={cadastrar.pacienteEncontrado}
          onPacienteChange={cadastrar.onPacienteChange}
        />
      </DialogDefault>
    </div>
  );
}
