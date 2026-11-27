"use client";

import { useActionState } from "react";
import type { Estado } from "@/app/(app)/pecas/actions";
import { botaoSecundario, campo } from "./estilos";

export function VendaEnjoei({
  action,
  semEstoque,
}: {
  action: (estado: Estado, formData: FormData) => Promise<Estado>;
  semEstoque: boolean;
}) {
  const [estado, enviar, enviando] = useActionState(action, undefined);

  return (
    <form action={enviar} className="flex flex-wrap items-end gap-3">
      <label className="flex flex-col gap-1 text-sm font-medium">
        Preço de venda (R$)
        <input name="preco" inputMode="decimal" placeholder="0,00" className={`${campo} w-32`} />
      </label>
      <button type="submit" disabled={enviando || semEstoque} className={botaoSecundario}>
        {enviando ? "Registrando..." : "Vendi no Enjoei"}
      </button>
      {estado?.erro && <p className="w-full text-sm text-red-600">{estado.erro}</p>}
      {estado?.ok && <p className="w-full text-sm text-emerald-700 dark:text-emerald-400">{estado.ok}</p>}
    </form>
  );
}
