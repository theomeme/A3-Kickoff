import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { centavosParaCampo } from "@/lib/dinheiro";
import { PecaForm } from "@/components/peca-form";
import { VendaEnjoei } from "@/components/venda-enjoei";
import { cartao, textoSuave } from "@/components/estilos";
import { atualizarPeca, excluirPeca, venderNoEnjoei } from "../actions";

export const metadata = { title: "Peça · Pilar" };

export default async function PecaPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: peca } = await supabase
    .from("produtos")
    .select("id, titulo, sku, quantidade, custo_centavos, anuncios(canal, url, status)")
    .eq("id", id)
    .maybeSingle();
  if (!peca) notFound();

  const enjoei = peca.anuncios?.find((a) => a.canal === "enjoei");

  return (
    <>
      <Link href="/pecas" className="text-sm underline">
        ← Peças
      </Link>
      <h1 className="mt-2 mb-6 text-2xl font-semibold">{peca.titulo}</h1>

      <PecaForm
        action={atualizarPeca.bind(null, peca.id)}
        rotulo="Salvar alterações"
        valores={{
          titulo: peca.titulo,
          sku: peca.sku,
          quantidade: peca.quantidade,
          custo: centavosParaCampo(peca.custo_centavos),
          enjoei: enjoei?.url,
        }}
      />

      {enjoei && (
        <section className={`mt-8 ${cartao}`}>
          <h2 className="font-semibold">Vendeu no Enjoei?</h2>
          <p className={`mb-3 ${textoSuave}`}>
            Registre aqui para baixar o estoque e pausar a peça nos outros canais.{" "}
            <a href={enjoei.url ?? "#"} target="_blank" rel="noreferrer" className="underline">
              Abrir anúncio
            </a>
          </p>
          <VendaEnjoei action={venderNoEnjoei.bind(null, peca.id)} semEstoque={peca.quantidade === 0} />
        </section>
      )}

      <form action={excluirPeca.bind(null, peca.id)} className="mt-8">
        <button className="text-sm text-red-600 underline">Excluir peça</button>
      </form>
    </>
  );
}
