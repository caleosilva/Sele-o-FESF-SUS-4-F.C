import { Clock } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { type Triagem } from "@/store/triagemStore";
import { formatarCpf } from "@/lib/utils/formatters";
import { COR_CONFIG } from "@/app/(protected)/triagem/_lib/cor-risco-config";

function formatarChegada(iso: string) {
  return new Date(iso).toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}


export function TriagemCard({ triagem }: { triagem: Triagem }) {
  const cfg = COR_CONFIG[triagem.cor_risco];

  return (
    <Card className="overflow-hidden border">
      {/* barra colorida lateral */}
      <div className={`h-1.5 w-full ${cfg.bar}`} />

      <CardHeader className="pb-2 pt-3 px-4 flex flex-row items-center justify-between">
        <div>
          <p className="font-semibold text-sm leading-tight">
            {triagem.paciente.nome}
          </p>
          <p className="text-xs text-muted-foreground">
            CPF {formatarCpf(triagem.paciente.cpf)}
          </p>
        </div>
        <Badge className={`text-xs border ${cfg.badge}`} variant="outline">
          {cfg.shortLabel}
        </Badge>
      </CardHeader>

      <CardContent className="px-4 pb-3 space-y-1">
        <p className="text-sm text-muted-foreground leading-snug">
          {triagem.queixa_principal}
        </p>
        <div className="flex items-center gap-1 text-xs text-muted-foreground pt-1">
          <Clock className="h-3 w-3" />
          <span>Chegada: {formatarChegada(triagem.created_at)}</span>
        </div>
      </CardContent>
    </Card>
  );
}
