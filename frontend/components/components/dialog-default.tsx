"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Loader2 } from "lucide-react";

interface DialogDefaultProps {
  /** Título do Dialog */
  title: string | React.ReactNode;

  /** Estado de controle de abertura (Vindo do Pai/Controller) */
  open: boolean;
  onOpenChange: (open: boolean) => void;

  /** Conteúdo do modal */
  children: React.ReactNode;

  /** * Define o comportamento do rodapé:
   * - 'form': Botões de Salvar (submit) e Cancelar.
   * - 'view': Apenas botão Fechar.
   * - 'custom': Não renderiza footer padrão (você passa no children se quiser).
   * - 'danger' : Opção para modal de delete, habilita o onSubmit
   */
  variant?: "form" | "view" | "custom" | "danger";

  /** (Opcional) Botão que abre o modal. Se omitido, o modal abre apenas via prop 'open' */
  trigger?: React.ReactNode;

  // --- Props Específicas para variant="form" ---
  /** ID do formulário HTML para vincular o botão de Salvar */
  formId?: string;
  /** Estado de loading do botão de salvar */
  isSubmitting?: boolean;
  /** Função chamada ao clicar em Cancelar (geralmente resetForm) */
  onCancel?: () => void;
  /** Texto do botão de confirmação (Default: "Salvar") */
  submitLabel?: string;

  onSubmit?: () => void;
  contentClassName?: string;
  showCloseButton?: boolean;
}

export default function DialogDefault({
  title,
  open,
  onOpenChange,
  children,
  variant = "view", // Padrão é visualização
  trigger,

  // Props de Form
  formId,
  isSubmitting = false,
  onCancel,
  submitLabel = "Salvar",

  onSubmit,
  contentClassName,
  showCloseButton = true,
}: DialogDefaultProps) {
  // Renderiza o rodapé baseado na variante
  const renderFooter = () => {
    if (variant === "custom") return null;

    if (variant === "view") {
      return (
        <DialogFooter>
          <DialogClose asChild>
            <Button type="button" variant="secondary">
              Fechar
            </Button>
          </DialogClose>
        </DialogFooter>
      );
    }

    if (variant === "danger") {
      return (
        <DialogFooter className="gap-2 sm:gap-0">
          <DialogClose asChild>
            <Button type="button" variant="secondary" disabled={isSubmitting}>
              Cancelar
            </Button>
          </DialogClose>
          <Button
            variant="destructive" // Botão vermelho do Shadcn
            onClick={onSubmit}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Excluindo...
              </>
            ) : (
              submitLabel || "Excluir"
            )}
          </Button>
        </DialogFooter>
      );
    }

    // variant === "form"
    return (
      <DialogFooter className="gap-4">
        <DialogClose asChild>
          <Button
            type="button"
            variant="secondary"
            disabled={isSubmitting}
            onClick={onCancel} // Chama o reset ao fechar, se passado
          >
            Cancelar
          </Button>
        </DialogClose>

        <Button type="submit" form={formId} disabled={isSubmitting}>
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Salvando...
            </>
          ) : (
            submitLabel
          )}
        </Button>
      </DialogFooter>
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {/* Se houver um trigger passado (ex: um botão solto na tela), renderiza-o */}
      {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}

      <DialogContent
        className={cn("sm:max-w-[825px] flex flex-col max-h-[90vh] overflow-hidden", contentClassName)}
        showCloseButton={showCloseButton}
        onInteractOutside={(event) => {
          event.preventDefault();
        }}
      >
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>

        {/* Área de conteúdo com Scroll automático */}
        <div className="flex-1 min-h-0 overflow-hidden p-1">
          <ScrollArea className="h-full pr-4">
            {children}
          </ScrollArea>
        </div>

        {renderFooter()}
      </DialogContent>
    </Dialog>
  );
}
