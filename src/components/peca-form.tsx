"use client";

import { useActionState } from "react";
import type { Estado } from "@/app/(app)/pecas/actions";
import { botao, campo, textoSuave } from "./estilos";

type Valores = {
  titulo?: string;
  sku?: string | null;
  quantidade?: number;
  custo?: string;
  enjoei?: string | null;
};

export function PecaForm({
  action,
  valores = {},
  rotulo,
}: {
  action: (estado: Estado, formData: FormData) => Promise<Estado>;
  valores?: Valores;
  rotulo: string;
}) {
  const [estado, enviar, enviando] = useActionState(action, undefined);

  return (
    <form action={enviar} className="flex flex-col gap-4">
      <label className="flex flex-col gap-1 text-sm font-medium">
        Título
        <input name="titulo" required defaultValue={valores.titulo} className={campo} />
      </label>
      <div className="grid gap-4 sm:grid-cols-3">
        <label className="flex flex-col gap-1 text-sm font-medium">
          SKU (opcional)
          <input name="sku" defaultValue={valores.sku ?? ""} className={campo} />
        </label>
        <label className="flex flex-col gap-1 text-sm font-medium">
          Quantidade
          <input
            name="quantidade"
            type="number"
            min={0}
            step={1}
            required
            defaultValue={valores.quantidade ?? 1}
            className={campo}
          />
        </label>
        <label className="flex flex-col gap-1 text-sm font-medium">
          Custo (R$)
          <input
            name="custo"
            inputMode="decimal"
            placeholder="0,00"
            defaultValue={valores.custo}
            className={campo}
          />
        </label>
      </div>
      <label className="flex flex-col gap-1 text-sm font-medium">
        Link do anúncio no Enjoei (opcional)
        <input
          name="enjoei"
          type="url"
          placeholder="https://www.enjoei.com.br/p/..."
          defaultValue={valores.enjoei ?? ""}
          className={campo}
        />
        <span className={`font-normal ${textoSuave}`}>
          O Enjoei não tem integração automática. Quando a peça vender em outro canal, avisamos
          você com este link para pausar.
        </span>
      </label>
      <div className="flex items-center gap-3">
        <button type="submit" disabled={enviando} className={botao}>
          {enviando ? "Salvando..." : rotulo}
        </button>
        {estado?.erro && <p className="text-sm text-red-600">{estado.erro}</p>}
        {estado?.ok && <p className="text-sm text-emerald-700 dark:text-emerald-400">{estado.ok}</p>}
      </div>
    </form>
  );
}
