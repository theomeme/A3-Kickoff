import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { reais } from "@/lib/dinheiro";
import { botao, cartao, textoSuave } from "@/components/estilos";

export const metadata = { title: "Peças · Pilar" };

export default async function PecasPage() {
  const supabase = await createClient();
  const { data: pecas } = await supabase
    .from("produtos")
    .select("id, titulo, sku, quantidade, custo_centavos, anuncios(canal, status)")
    .order("criado_em", { ascending: false });

  return (
    <>
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-2xl font-semibold">Peças</h1>
        <Link href="/pecas/nova" className={botao}>
          Nova peça
        </Link>
      </div>

      {!pecas?.length ? (
        <div className={`mt-6 ${cartao}`}>
          <p>Nenhuma peça cadastrada ainda.</p>
          <p className={textoSuave}>
            Cadastre cada peça uma vez. Depois ligamos ela aos anúncios no Mercado Livre, Amazon e
            Enjoei.
          </p>
        </div>
      ) : (
        <ul className="mt-6 divide-y divide-neutral-200 rounded-lg border border-neutral-200 dark:divide-neutral-800 dark:border-neutral-800">
          {pecas.map((p) => (
            <li key={p.id}>
              <Link
                href={`/pecas/${p.id}`}
                className="flex items-center gap-4 p-4 hover:bg-neutral-50 dark:hover:bg-neutral-900"
              >
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium">{p.titulo}</p>
                  <p className={textoSuave}>
                    {p.sku ? `${p.sku} · ` : ""}custo {reais(p.custo_centavos)}
                    {p.anuncios?.some((a) => a.canal === "enjoei") ? " · Enjoei" : ""}
                  </p>
                </div>
                <span
                  className={`shrink-0 rounded-full px-2 py-0.5 text-sm ${
                    p.quantidade > 0
                      ? "bg-emerald-50 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-200"
                      : "bg-neutral-100 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-300"
                  }`}
                >
                  {p.quantidade > 0 ? `${p.quantidade} em estoque` : "Vendida"}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
