import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { reais } from "@/lib/dinheiro";
import { cartao, textoSuave } from "@/components/estilos";

export const metadata = { title: "Painel · Pilar" };

export default async function PainelPage() {
  const supabase = await createClient();
  const { data: estoque } = await supabase
    .from("valor_estoque")
    .select("pecas, valor_centavos")
    .maybeSingle();

  return (
    <>
      <h1 className="text-2xl font-semibold">Painel</h1>
      <section className="mt-6 grid gap-4 sm:grid-cols-2">
        <div className={cartao}>
          <p className={textoSuave}>Valor do estoque (custo)</p>
          <p className="mt-1 text-2xl font-semibold">{reais(estoque?.valor_centavos ?? 0)}</p>
          <p className={textoSuave}>{estoque?.pecas ?? 0} peças em estoque</p>
        </div>
        <div className={cartao}>
          <p className={textoSuave}>Canais conectados</p>
          <p className="mt-1 text-sm">
            Em breve: conectar Mercado Livre e Amazon.{" "}
            <Link href="/pecas" className="underline">
              Cadastre suas peças
            </Link>{" "}
            e os links do Enjoei enquanto isso.
          </p>
        </div>
      </section>
    </>
  );
}
