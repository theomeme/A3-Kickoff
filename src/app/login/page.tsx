import { enviarLink } from "./actions";

export const metadata = { title: "Entrar · Pilar" };

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ enviado?: string; erro?: string }>;
}) {
  const { enviado, erro } = await searchParams;

  return (
    <main className="mx-auto flex min-h-dvh max-w-sm flex-col justify-center px-4">
      <h1 className="text-3xl font-semibold tracking-tight">Pilar</h1>
      <p className="mt-2 text-sm text-neutral-600 dark:text-neutral-400">
        Nunca venda a mesma peça duas vezes.
      </p>

      {enviado ? (
        <p className="mt-8 rounded-md bg-emerald-50 p-4 text-sm text-emerald-900 dark:bg-emerald-950 dark:text-emerald-100">
          Enviamos um link de acesso para o seu e-mail. Abra-o neste aparelho para entrar.
        </p>
      ) : (
        <form action={enviarLink} className="mt-8 flex flex-col gap-3">
          <label htmlFor="email" className="text-sm font-medium">
            E-mail
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            autoComplete="email"
            placeholder="voce@exemplo.com"
            className="rounded-md border border-neutral-300 bg-transparent px-3 py-2 dark:border-neutral-700"
          />
          <button
            type="submit"
            className="rounded-md bg-neutral-900 px-3 py-2 font-medium text-white hover:bg-neutral-700 dark:bg-white dark:text-neutral-900"
          >
            Receber link de acesso
          </button>
          {erro && (
            <p className="text-sm text-red-600">
              {erro === "email" ? "Informe um e-mail." : "Não foi possível enviar o link. Tente de novo."}
            </p>
          )}
        </form>
      )}
    </main>
  );
}
