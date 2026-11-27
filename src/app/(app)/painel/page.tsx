import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export const metadata = { title: "Painel · Pilar" };

const reais = (centavos: number) =>
  (centavos / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

export default async function PainelPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: estoque } = await supabase
    .from("valor_estoque")
    .select("pecas, valor_centavos")
    .maybeSingle();

  return (
    <main className="mx-auto max-w-3xl px-4 py-8">
      <header className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Painel</h1>
        <form action="/auth/sair" method="post">
          <button className="text-sm text-neutral-600 underline dark:text-neutral-400">Sair</button>
        </form>
      </header>

      <section className="mt-8 grid gap-4 sm:grid-cols-2">
        <div className="rounded-lg border border-neutral-200 p-4 dark:border-neutral-800">
          <p className="text-sm text-neutral-600 dark:text-neutral-400">Valor do estoque (custo)</p>
          <p className="mt-1 text-2xl font-semibold">{reais(estoque?.valor_centavos ?? 0)}</p>
          <p className="text-sm text-neutral-600 dark:text-neutral-400">{estoque?.pecas ?? 0} peças</p>
        </div>
        <div className="rounded-lg border border-neutral-200 p-4 dark:border-neutral-800">
          <p className="text-sm text-neutral-600 dark:text-neutral-400">Canais conectados</p>
          <p className="mt-1 text-sm">
            Em breve: conectar Mercado Livre, Amazon e cadastrar links do Enjoei.
          </p>
        </div>
      </section>
    </main>
  );
}
