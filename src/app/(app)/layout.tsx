import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  return (
    <div className="min-h-dvh">
      <nav className="border-b border-neutral-200 dark:border-neutral-800">
        <div className="mx-auto flex max-w-3xl items-center gap-5 px-4 py-3 text-sm">
          <Link href="/painel" className="text-base font-semibold">
            Pilar
          </Link>
          <Link href="/painel" className="hover:underline">
            Painel
          </Link>
          <Link href="/pecas" className="hover:underline">
            Peças
          </Link>
          <form action="/auth/sair" method="post" className="ml-auto">
            <button className="text-neutral-600 hover:underline dark:text-neutral-400">Sair</button>
          </form>
        </div>
      </nav>
      <main className="mx-auto max-w-3xl px-4 py-8">{children}</main>
    </div>
  );
}
