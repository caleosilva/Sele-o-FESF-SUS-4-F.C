import Link from "next/link";
import { HeartPulse } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center gap-6 bg-muted/40 px-4">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 ring-2 ring-primary/20">
        <HeartPulse className="h-8 w-8 text-primary" />
      </div>
      <div className="text-center space-y-1">
        <h1 className="text-4xl font-bold tracking-tight">404</h1>
        <p className="text-muted-foreground text-sm">Página não encontrada.</p>
      </div>
      <Button asChild variant="outline">
        <Link href="/triagem">Voltar ao início</Link>
      </Button>
    </main>
  );
}
