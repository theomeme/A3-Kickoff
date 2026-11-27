"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { paraCentavos } from "@/lib/dinheiro";

export type Estado = { erro?: string; ok?: string } | undefined;

function lerPeca(formData: FormData) {
  const titulo = String(formData.get("titulo") ?? "").trim();
  const sku = String(formData.get("sku") ?? "").trim() || null;
  const quantidade = Number(formData.get("quantidade") ?? 1);
  const custo = paraCentavos(String(formData.get("custo") ?? ""));

  if (!titulo) return { erro: "Dê um título para a peça." } as const;
  if (!Number.isInteger(quantidade) || quantidade < 0)
    return { erro: "A quantidade precisa ser um número inteiro, 0 ou mais." } as const;
  if (custo === null) return { erro: "Custo inválido. Use por exemplo 35,90." } as const;

  return { dados: { titulo, sku, quantidade, custo_centavos: custo } } as const;
}

function lerLinkEnjoei(formData: FormData): string | null | { erro: string } {
  const url = String(formData.get("enjoei") ?? "").trim();
  if (!url) return null;
  try {
    const u = new URL(url);
    if (!u.hostname.endsWith("enjoei.com.br")) return { erro: "O link precisa ser de enjoei.com.br." };
    return u.toString();
  } catch {
    return { erro: "Link do Enjoei inválido." };
  }
}

async function salvarEnjoei(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string,
  produtoId: string,
  url: string | null,
) {
  const { data: atual } = await supabase
    .from("anuncios")
    .select("id")
    .eq("produto_id", produtoId)
    .eq("canal", "enjoei")
    .maybeSingle();

  if (!url) {
    if (atual) await supabase.from("anuncios").delete().eq("id", atual.id);
    return null;
  }
  const { error } = atual
    ? await supabase
        .from("anuncios")
        .update({ url, atualizado_em: new Date().toISOString() })
        .eq("id", atual.id)
    : await supabase
        .from("anuncios")
        .insert({ user_id: userId, produto_id: produtoId, canal: "enjoei", url });
  return error;
}

export async function criarPeca(_: Estado, formData: FormData): Promise<Estado> {
  const lido = lerPeca(formData);
  if ("erro" in lido) return { erro: lido.erro };
  const enjoei = lerLinkEnjoei(formData);
  if (enjoei && typeof enjoei === "object") return enjoei;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data, error } = await supabase
    .from("produtos")
    .insert({ ...lido.dados, user_id: user.id })
    .select("id")
    .single();
  if (error || !data) return { erro: "Não foi possível salvar a peça." };

  if (await salvarEnjoei(supabase, user.id, data.id, enjoei))
    return { erro: "A peça foi salva, mas o link do Enjoei não." };

  revalidatePath("/pecas");
  redirect("/pecas");
}

export async function atualizarPeca(id: string, _: Estado, formData: FormData): Promise<Estado> {
  const lido = lerPeca(formData);
  if ("erro" in lido) return { erro: lido.erro };
  const enjoei = lerLinkEnjoei(formData);
  if (enjoei && typeof enjoei === "object") return enjoei;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { error } = await supabase
    .from("produtos")
    .update({ ...lido.dados, atualizado_em: new Date().toISOString() })
    .eq("id", id);
  if (error) return { erro: "Não foi possível salvar as alterações." };

  if (await salvarEnjoei(supabase, user.id, id, enjoei))
    return { erro: "As alterações foram salvas, mas o link do Enjoei não." };

  revalidatePath("/pecas");
  revalidatePath(`/pecas/${id}`);
  return { ok: "Alterações salvas." };
}

export async function excluirPeca(id: string) {
  const supabase = await createClient();
  await supabase.from("produtos").delete().eq("id", id);
  revalidatePath("/pecas");
  redirect("/pecas");
}

export async function venderNoEnjoei(id: string, _: Estado, formData: FormData): Promise<Estado> {
  const preco = paraCentavos(String(formData.get("preco") ?? ""));
  if (preco === null) return { erro: "Preço inválido. Use por exemplo 89,90." };

  const supabase = await createClient();
  const { data: restante, error } = await supabase.rpc("registrar_venda_manual", {
    p_produto_id: id,
    p_canal: "enjoei",
    p_bruto_centavos: preco,
  });
  if (error) {
    return {
      erro: error.message.includes("sem_estoque")
        ? "Esta peça já está sem estoque."
        : "Não foi possível registrar a venda.",
    };
  }

  revalidatePath("/pecas");
  revalidatePath(`/pecas/${id}`);
  revalidatePath("/painel");
  return {
    ok:
      restante === 0
        ? "Venda registrada. A peça zerou e os anúncios nos outros canais vão ser pausados."
        : `Venda registrada. Restam ${restante}.`,
  };
}
