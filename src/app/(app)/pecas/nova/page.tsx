import Link from "next/link";
import { PecaForm } from "@/components/peca-form";
import { criarPeca } from "../actions";

export const metadata = { title: "Nova peça · Pilar" };

export default function NovaPecaPage() {
  return (
    <>
      <Link href="/pecas" className="text-sm underline">
        ← Peças
      </Link>
      <h1 className="mt-2 mb-6 text-2xl font-semibold">Nova peça</h1>
      <PecaForm action={criarPeca} rotulo="Salvar peça" />
    </>
  );
}
