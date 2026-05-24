"use client";

import * as React from "react";
import { UseFormReturn, FieldValues, Path } from "react-hook-form";
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { CalendarIcon, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

// --- TIPAGEM ---
type TipoInput =
  | "text"
  | "email"
  | "password"
  | "number"
  | "tel"
  | "url"
  | "date"
  | "time"
  | "datetime-local";

interface PropsFormFieldBasic<TFormValues extends FieldValues> {
  // Form (tipado com react-hook-form)
  form: UseFormReturn<TFormValues>;
  name: Path<TFormValues>;

  // Essenciais
  label: string;
  type?: TipoInput;
  placeholder?: string;

  // Opcionais
  descricao?: string;
  disabled?: boolean;
  obrigatorio?: boolean;

  // Validações/Restrições
  maxLength?: number;
  minLength?: number;
  max?: number | string; // Para number/date
  min?: number | string; // Para number/date
  step?: number | string; // Para number
  pattern?: string; // Regex pattern

  // Customização
  className?: string;
  classNameLabel?: string;
  classNameInput?: string;

  // Transformações
  transformarValor?: (valor: any) => any;
  onChange?: (valor: any) => void;
  onKeyDown?: React.KeyboardEventHandler<HTMLInputElement>;
}

// --- COMPONENTE PRINCIPAL ---
export default function FormFieldBasic<TFormValues extends FieldValues>({
  form,
  name,
  label,
  type = "text",
  placeholder,
  descricao,
  disabled = false,
  obrigatorio = false,
  maxLength,
  minLength,
  max,
  min,
  step,
  pattern,
  className,
  classNameLabel,
  classNameInput,
  transformarValor,
  onChange,
  onKeyDown,
}: PropsFormFieldBasic<TFormValues>) {
  /**
   * Formata o valor do campo baseado no tipo
   */
  const formatarValor = React.useCallback(
    (valor: any): string => {
      // Valores nulos/undefined/vazios
      if (valor === undefined || valor === null || valor === "") {
        return "";
      }

      // Aplicar transformação customizada se existir
      if (transformarValor) {
        return transformarValor(valor);
      }

      // Formatação para datas
      if (type === "date" || type === "datetime-local") {
        try {
          if (typeof valor === "string" || valor instanceof Date) {
            const data = new Date(valor);

            if (isNaN(data.getTime())) {
              return "";
            }

            const pad = (n: number) => String(n).padStart(2, "0");

            // Para datetime-local: YYYY-MM-DDTHH:mm (hora local, não UTC)
            if (type === "datetime-local") {
              return `${data.getFullYear()}-${pad(data.getMonth() + 1)}-${pad(data.getDate())}T${pad(data.getHours())}:${pad(data.getMinutes())}`;
            }

            // Para date: YYYY-MM-DD (data local, não UTC)
            return `${data.getFullYear()}-${pad(data.getMonth() + 1)}-${pad(data.getDate())}`;
          }
        } catch (error) {
          console.error("Erro ao formatar data:", error);
          return "";
        }
      }

      // Para números, garantir que seja string válida
      if (type === "number" && typeof valor === "number") {
        return valor.toString();
      }

      return String(valor);
    },
    [type, transformarValor],
  );

  /**
   * Renderiza o label com estilo condicional
   */
  const renderizarLabel = () => {
    return (
      <FormLabel
        className={cn(disabled && "text-muted-foreground", classNameLabel)}
      >
        {label}
        {obrigatorio && <span className="text-destructive ml-1">*</span>}
      </FormLabel>
    );
  };

  return (
    <FormField
      control={form.control}
      name={name}
      render={({ field }) => (
        <FormItem className={className}>
          {renderizarLabel()}

          <FormControl>
            <Input
              {...field}
              type={type}
              placeholder={placeholder}
              disabled={disabled}
              value={formatarValor(field.value)}
              onChange={(e) => {
                let novoValor: any = e.target.value;

                if (type === "number") {
                  if (novoValor === "") {
                    novoValor = null;
                  } else {
                    novoValor = parseFloat(novoValor);
                    if (isNaN(novoValor)) {
                      novoValor = null;
                    } else {
                      if (max !== undefined && novoValor > Number(max)) novoValor = Number(max);
                      if (min !== undefined && novoValor < Number(min)) novoValor = Number(min);
                    }
                  }
                }

                field.onChange(novoValor);
                onChange?.(novoValor);
              }}
              // Atributos HTML de validação
              maxLength={maxLength}
              minLength={minLength}
              max={max}
              min={min}
              step={step}
              pattern={pattern}
              onKeyDown={onKeyDown}
              required={obrigatorio}
              aria-invalid={!!form.formState.errors[name]}
              aria-describedby={descricao ? `${name}-description` : undefined}
              className={cn(classNameInput)}
            />
          </FormControl>

          {descricao && (
            <FormDescription id={`${name}-description`}>
              {descricao}
            </FormDescription>
          )}

          <FormMessage />
        </FormItem>
      )}
    />
  );
}

// --- VARIANTES PRÉ-CONFIGURADAS ---

/**
 * Campo de Email pré-configurado
 */
export function FormFieldEmail<TFormValues extends FieldValues>(
  props: Omit<PropsFormFieldBasic<TFormValues>, "type">,
) {
  return (
    <FormFieldBasic
      {...props}
      type="email"
      placeholder={props.placeholder || "exemplo@email.com"}
    />
  );
}

/**
 * Campo de Senha pré-configurado
 */
export function FormFieldPassword<TFormValues extends FieldValues>(
  props: Omit<PropsFormFieldBasic<TFormValues>, "type">,
) {
  return (
    <FormFieldBasic
      {...props}
      type="password"
      placeholder={props.placeholder || "••••••••"}
      minLength={props.minLength || 6}
    />
  );
}

/**
 * Campo de Data pré-configurado (input HTML nativo)
 */
export function FormFieldDate<TFormValues extends FieldValues>(
  props: Omit<PropsFormFieldBasic<TFormValues>, "type">,
) {
  return <FormFieldBasic {...props} type="date" />;
}

interface PropsFormFieldDatePicker<TFormValues extends FieldValues> {
  form: UseFormReturn<TFormValues>;
  name: Path<TFormValues>;
  label: string;
  descricao?: string;
  disabled?: boolean;
  obrigatorio?: boolean;
  className?: string;
  classNameLabel?: string;
  /** Desabilita datas futuras no calendário. Padrão: false. */
  desabilitarFuturas?: boolean;
}

/**
 * Campo de Data com date-picker Shadcn (input + calendário popover).
 * Valor armazenado como string YYYY-MM-DD (ou null).
 */
export function FormFieldDatePicker<TFormValues extends FieldValues>({
  form,
  name,
  label,
  descricao,
  disabled = false,
  obrigatorio = false,
  className,
  classNameLabel,
  desabilitarFuturas = false,
}: PropsFormFieldDatePicker<TFormValues>) {
  const [aberto, setAberto] = React.useState(false);

  return (
    <FormField
      control={form.control}
      name={name}
      render={({ field }) => {
        const valorData: Date | undefined = (() => {
          if (!field.value) return undefined;
          const d = new Date(`${field.value}T00:00:00`);
          return isNaN(d.getTime()) ? undefined : d;
        })();

        const handleSelect = (date: Date | undefined) => {
          if (date) {
            const pad = (n: number) => String(n).padStart(2, "0");
            field.onChange(
              `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`,
            );
          } else {
            field.onChange(null);
          }
          setAberto(false);
        };

        return (
          <FormItem className={className}>
            <FormLabel
              className={cn(disabled && "text-muted-foreground", classNameLabel)}
            >
              {label}
              {obrigatorio && <span className="text-destructive ml-1">*</span>}
            </FormLabel>
            <Popover open={aberto} onOpenChange={setAberto}>
              <div className="relative">
                <FormControl>
                  <Input
                    readOnly
                    disabled={disabled}
                    placeholder="Selecione uma data"
                    value={valorData ? valorData.toLocaleDateString("pt-BR") : ""}
                    onClick={() => !disabled && setAberto(true)}
                    className={cn("pr-10", !disabled && "cursor-pointer")}
                    aria-invalid={!!form.formState.errors[name]}
                  />
                </FormControl>
                <PopoverTrigger asChild>
                  <button
                    type="button"
                    disabled={disabled}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground disabled:pointer-events-none disabled:opacity-50"
                    aria-label="Abrir calendário"
                  >
                    <CalendarIcon className="size-4" />
                  </button>
                </PopoverTrigger>
              </div>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={valorData}
                  onSelect={handleSelect}
                  disabled={desabilitarFuturas ? (date) => date > new Date() : undefined}
                  captionLayout="dropdown"
                  autoFocus
                />
              </PopoverContent>
            </Popover>
            {descricao && <FormDescription>{descricao}</FormDescription>}
            <FormMessage />
          </FormItem>
        );
      }}
    />
  );
}

/**
 * Campo de Número pré-configurado
 */
export function FormFieldNumber<TFormValues extends FieldValues>(
  props: Omit<PropsFormFieldBasic<TFormValues>, "type"> & {
    casasDecimais?: number;
  },
) {
  const { casasDecimais, min, ...rest } = props;

  // Bloqueia teclas que <input type="number"> aceita mas invalidam o valor:
  // e/E (notação científica), + (sinal positivo explícito)
  // - (negativo) quando min >= 0
  // . (decimal) quando não há casas decimais
  const teclasBloqueadas = React.useMemo(() => {
    const bloqueadas = ["e", "E", "+"];
    if (min !== undefined && Number(min) >= 0) bloqueadas.push("-");
    if (!casasDecimais) bloqueadas.push(".", ",");
    return bloqueadas;
  }, [min, casasDecimais]);

  return (
    <FormFieldBasic
      {...rest}
      min={min}
      type="number"
      step={casasDecimais ? `0.${"0".repeat(casasDecimais - 1)}1` : "1"}
      onKeyDown={(e) => {
        if (teclasBloqueadas.includes(e.key)) e.preventDefault();
      }}
    />
  );
}

// --- CAMPO MONETÁRIO ---

interface PropsFormFieldMoney<TFormValues extends FieldValues> {
  form: UseFormReturn<TFormValues>;
  name: Path<TFormValues>;
  label: string;
  placeholder?: string;
  descricao?: string;
  disabled?: boolean;
  obrigatorio?: boolean;
  /** Valor máximo permitido. Excedido o limite, o valor é clampado ao blur. */
  max?: number;
  /** Permite centavos (duas casas decimais). Padrão: true. */
  permitirCentavos?: boolean;
  className?: string;
  classNameLabel?: string;
  classNameInput?: string;
}

function formatarMoeda(valor: number | null | undefined, permitirCentavos: boolean): string {
  if (valor === null || valor === undefined) return "";
  return new Intl.NumberFormat("pt-BR", {
    minimumFractionDigits: permitirCentavos ? 2 : 0,
    maximumFractionDigits: permitirCentavos ? 2 : 0,
  }).format(valor);
}

function parsearMoeda(texto: string, permitirCentavos: boolean): number | null {
  const limpo = texto.trim();
  if (!limpo) return null;
  // Formato brasileiro: ponto = separador de milhar, vírgula = decimal
  const normalizado = limpo.replace(/\./g, "").replace(",", ".");
  const numero = parseFloat(normalizado);
  if (isNaN(numero) || numero < 0) return null;
  return permitirCentavos ? numero : Math.trunc(numero);
}

// Componente interno para poder usar hooks dentro do render prop
function MoneyInput<TFormValues extends FieldValues>({
  field,
  name,
  errors,
  label,
  obrigatorio,
  disabled,
  placeholder,
  descricao,
  max,
  permitirCentavos = true,
  className,
  classNameLabel,
  classNameInput,
}: Omit<PropsFormFieldMoney<TFormValues>, "form"> & {
  field: any;
  errors: any;
}) {
  const [displayValue, setDisplayValue] = React.useState<string>(() =>
    formatarMoeda(field.value, permitirCentavos),
  );

  // Sincroniza com reset ou alteração externa do form
  React.useEffect(() => {
    setDisplayValue(formatarMoeda(field.value, permitirCentavos));
  }, [field.value, permitirCentavos]);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    let texto = e.target.value;
    // Permite apenas dígitos, vírgula e ponto
    texto = texto.replace(/[^\d.,]/g, "");
    if (!permitirCentavos) {
      // Sem centavos: apenas inteiros
      texto = texto.replace(/[.,]/g, "");
    } else {
      // Limita a no máximo duas casas decimais após a vírgula
      const temSeparador = /[,.]/.test(texto);
      const match = texto.match(/^(\d*)[,.]?(\d{0,2}).*$/);
      if (match) {
        texto = temSeparador ? `${match[1]},${match[2]}` : match[1];
      }
    }
    setDisplayValue(texto);
  }

  function handleBlur() {
    let numero = parsearMoeda(displayValue, permitirCentavos);
    if (max !== undefined && numero !== null && numero > max) numero = max;
    setDisplayValue(formatarMoeda(numero, permitirCentavos));
    // Commita o valor no form somente ao sair do campo
    field.onChange(numero);
    field.onBlur();
  }

  return (
    <FormItem className={className}>
      <FormLabel className={cn(disabled && "text-muted-foreground", classNameLabel)}>
        {label}
        {obrigatorio && <span className="text-destructive ml-1">*</span>}
      </FormLabel>
      <FormControl>
        <div className="relative">
          <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground select-none">
            R$
          </span>
          <Input
            type="text"
            inputMode="decimal"
            placeholder={placeholder ?? (permitirCentavos ? "0,00" : "0")}
            disabled={disabled}
            value={displayValue}
            onChange={handleChange}
            onBlur={handleBlur}
            className={cn("pl-9", classNameInput)}
            aria-invalid={!!errors[name]}
          />
        </div>
      </FormControl>
      {descricao && <FormDescription>{descricao}</FormDescription>}
      <FormMessage />
    </FormItem>
  );
}

/**
 * Campo monetário em R$ com formatação brasileira.
 * Suporta valor máximo e controle de centavos.
 */
export function FormFieldMoney<TFormValues extends FieldValues>({
  form,
  name,
  ...props
}: PropsFormFieldMoney<TFormValues>) {
  return (
    <FormField
      control={form.control}
      name={name}
      render={({ field }) => (
        <MoneyInput
          field={field}
          name={name}
          errors={form.formState.errors}
          {...props}
        />
      )}
    />
  );
}

// --- DATE TIME PICKER ---

function parsearValorDatetime(valor: string | null | undefined): {
  data: Date | undefined;
  horas: string;
  minutos: string;
} {
  if (!valor) return { data: undefined, horas: "00", minutos: "00" };
  const [dataParte, tempoParte = "00:00"] = valor.split("T");
  const d = new Date(`${dataParte}T00:00:00`);
  const [h = "00", m = "00"] = tempoParte.split(":");
  return {
    data: isNaN(d.getTime()) ? undefined : d,
    horas: h.padStart(2, "0"),
    minutos: m.padStart(2, "0"),
  };
}

function isoParaDisplay(valor: string): string {
  const { data, horas: h, minutos: m } = parsearValorDatetime(valor);
  if (!data) return "";
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${pad(data.getDate())}/${pad(data.getMonth() + 1)}/${data.getFullYear()} ${h}:${m}`;
}

interface PropsDateTimePickerInput {
  value: string;
  onChange: (value: string) => void;
  label: string;
  disabled?: boolean;
  placeholder?: string;
  classNameLabel?: string;
  isInvalid?: boolean;
}

/**
 * Seletor de data e hora standalone — não depende de react-hook-form.
 * Valor em/out: string "YYYY-MM-DDTHH:mm" (ou "" para vazio).
 */
export function DateTimePickerInput({
  value,
  onChange,
  label,
  disabled = false,
  placeholder = "Selecione data e hora",
  classNameLabel,
  isInvalid,
}: PropsDateTimePickerInput) {
  const [aberto, setAberto] = React.useState(false);
  const [dataLocal, setDataLocal] = React.useState<Date | undefined>(undefined);
  const [horas, setHoras] = React.useState("00");
  const [minutos, setMinutos] = React.useState("00");

  React.useEffect(() => {
    if (!aberto) return;
    const { data, horas: h, minutos: m } = parsearValorDatetime(value || null);
    setDataLocal(data);
    setHoras(h);
    setMinutos(m);
  }, [aberto]);

  const clampHora = (v: string) =>
    String(Math.min(23, Math.max(0, parseInt(v) || 0))).padStart(2, "0");

  const clampMinuto = (v: string) =>
    String(Math.min(59, Math.max(0, parseInt(v) || 0))).padStart(2, "0");

  const confirmar = () => {
    if (dataLocal) {
      const pad = (n: number) => String(n).padStart(2, "0");
      const iso = `${dataLocal.getFullYear()}-${pad(dataLocal.getMonth() + 1)}-${pad(dataLocal.getDate())}T${horas}:${minutos}`;
      onChange(iso);
    }
    setAberto(false);
  };

  return (
    <div className="flex flex-col gap-1.5">
      <span className={cn("text-sm font-medium", classNameLabel, disabled && "text-muted-foreground")}>
        {label}
      </span>
      <Popover open={aberto} onOpenChange={setAberto}>
        <div className="relative">
          <Input
            readOnly
            disabled={disabled}
            placeholder={placeholder}
            value={isoParaDisplay(value)}
            onClick={() => !disabled && setAberto(true)}
            className={cn("pr-10 bg-background", !disabled && "cursor-pointer", isInvalid && "border-destructive")}
          />
          <PopoverTrigger asChild>
            <button
              type="button"
              disabled={disabled}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground disabled:pointer-events-none disabled:opacity-50"
              aria-label="Abrir calendário"
            >
              <CalendarIcon className="size-4" />
            </button>
          </PopoverTrigger>
        </div>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="single"
            selected={dataLocal}
            onSelect={setDataLocal}
            captionLayout="dropdown"
            autoFocus
          />
          <div className="border-t px-3 py-3">
            <div className="flex items-center gap-2">
              <Clock className="size-4 shrink-0 text-muted-foreground" />
              <Input
                type="number"
                min={0}
                max={23}
                value={parseInt(horas)}
                onChange={(e) => setHoras(clampHora(e.target.value))}
                onBlur={() => setHoras(horas.padStart(2, "0"))}
                className="w-16 text-center [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                aria-label="Horas"
              />
              <span className="text-muted-foreground font-medium">:</span>
              <Input
                type="number"
                min={0}
                max={59}
                value={parseInt(minutos)}
                onChange={(e) => setMinutos(clampMinuto(e.target.value))}
                onBlur={() => setMinutos(minutos.padStart(2, "0"))}
                className="w-16 text-center [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                aria-label="Minutos"
              />
              <Button
                type="button"
                size="sm"
                className="ml-auto"
                onClick={confirmar}
                disabled={!dataLocal}
              >
                Confirmar
              </Button>
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}

interface PropsFormFieldDateTimePicker<TFormValues extends FieldValues> {
  form: UseFormReturn<TFormValues>;
  name: Path<TFormValues>;
  label: string;
  descricao?: string;
  disabled?: boolean;
  obrigatorio?: boolean;
  className?: string;
  classNameLabel?: string;
}

/**
 * Campo de Data e Hora integrado ao react-hook-form.
 * Valor armazenado como string "YYYY-MM-DDTHH:mm" (ou null).
 */
export function FormFieldDateTimePicker<TFormValues extends FieldValues>({
  form,
  name,
  label,
  descricao,
  disabled = false,
  obrigatorio = false,
  className,
  classNameLabel,
}: PropsFormFieldDateTimePicker<TFormValues>) {
  return (
    <FormField
      control={form.control}
      name={name}
      render={({ field, fieldState }) => {
        return (
          <FormItem className={className}>
            <FormLabel className={cn(disabled && "text-muted-foreground", classNameLabel)}>
              {label}
              {obrigatorio && <span className="text-destructive ml-1">*</span>}
            </FormLabel>
            <FormControl>
              <DateTimePickerInput
                value={field.value ?? ""}
                onChange={field.onChange}
                label=""
                disabled={disabled}
                isInvalid={!!fieldState.error}
              />
            </FormControl>
            {descricao && <FormDescription>{descricao}</FormDescription>}
            <FormMessage />
          </FormItem>
        );
      }}
    />
  );
}
