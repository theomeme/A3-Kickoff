# Pilar

Gerenciador multicanal para vendedores de peça única no Mercado Livre, Amazon e Enjoei.
Promessa central: **nunca vender a mesma peça duas vezes**.

Plano do MVP 1: https://claude.ai/artifact/X5aZKPn4G2WM9h9NLGjvip

## Stack

- Next.js (App Router) + TypeScript + Tailwind
- Supabase (Postgres + login por link no e-mail)
- Próximas etapas: Inngest (fila de sincronização), Vercel (hospedagem), Resend (alertas)

## Arquitetura

1. **Telas** (`src/app`): login, painel, conexão de canais, catálogo.
2. **API e webhooks** (rotas do Next.js): OAuth do ML/Amazon e avisos de venda, que só são registrados e enfileirados.
3. **Worker** (Inngest): processa cada venda, baixa o estoque do produto e pausa os anúncios nos outros canais (ou alerta no Enjoei), com reenvio automático e conferência periódica.
4. **Banco** (`supabase/migrations`): `contas_canal`, `produtos`, `anuncios`, `pedidos`, `eventos_sync` e a view `valor_estoque`. Cada vendedor só vê os próprios dados (RLS).

## Rodando localmente

1. Crie um projeto no [Supabase](https://supabase.com) (plano gratuito).
2. No SQL Editor, rode `supabase/migrations/0001_init.sql`.
3. Em Authentication > URL Configuration, adicione `http://localhost:3000/auth/callback` às Redirect URLs.
4. Copie `.env.example` para `.env.local` e preencha com a URL e a anon key do projeto.
5. `npm install` e `npm run dev`, depois abra http://localhost:3000.

## Licença

Software proprietário — todos os direitos reservados. Este repositório **não é open source**; veja [LICENSE](LICENSE).
