-- Pilar: modelo inicial do MVP 1
-- Cada peça é um "produto" do vendedor, ligado a um anúncio em cada canal.
-- Uma venda em qualquer canal mexe no produto, e o produto manda nos anúncios.

create type canal as enum ('mercado_livre', 'amazon', 'enjoei');
create type status_anuncio as enum ('ativo', 'pausado', 'encerrado');
create type status_sync as enum ('pendente', 'ok', 'erro', 'alerta_manual');

-- Conta de um canal conectada por um vendedor (tokens OAuth ficam criptografados).
create table contas_canal (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  canal canal not null,
  id_externo text,              -- id do vendedor no canal (ex.: user_id do ML)
  apelido text,
  access_token_cifrado text,    -- nunca em texto puro
  refresh_token_cifrado text,
  token_expira_em timestamptz,
  conectada_em timestamptz not null default now(),
  unique (user_id, canal, id_externo)
);

-- A peça em si: quantidade e custo vivem aqui, não nos anúncios.
create table produtos (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  titulo text not null,
  sku text,
  quantidade integer not null default 1 check (quantidade >= 0),
  custo_centavos integer not null default 0 check (custo_centavos >= 0),
  criado_em timestamptz not null default now(),
  atualizado_em timestamptz not null default now()
);

-- Anúncio de um produto em um canal. No Enjoei guardamos só o link (sem API).
create table anuncios (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  produto_id uuid references produtos (id) on delete set null,
  conta_id uuid references contas_canal (id) on delete cascade,
  canal canal not null,
  id_externo text,              -- MLB..., SKU/ASIN da Amazon
  url text,
  titulo text,
  preco_centavos integer,
  status status_anuncio not null default 'ativo',
  atualizado_em timestamptz not null default now(),
  unique (canal, id_externo)
);

-- Vendas recebidas dos canais, base do caixa por canal.
create table pedidos (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  canal canal not null,
  id_externo text not null,
  anuncio_id uuid references anuncios (id) on delete set null,
  quantidade integer not null default 1,
  bruto_centavos integer not null default 0,
  taxas_centavos integer not null default 0,
  liquido_centavos integer generated always as (bruto_centavos - taxas_centavos) stored,
  vendido_em timestamptz not null,
  recebido_em timestamptz not null default now(),
  unique (canal, id_externo)    -- o mesmo aviso de venda nunca conta duas vezes
);

-- Log de cada ação de sincronização (pausar, zerar, alertar), para auditoria e reenvio.
create table eventos_sync (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  pedido_id uuid references pedidos (id) on delete set null,
  anuncio_id uuid references anuncios (id) on delete set null,
  acao text not null,           -- 'pausar', 'zerar_estoque', 'alertar_enjoei'
  status status_sync not null default 'pendente',
  tentativas integer not null default 0,
  erro text,
  criado_em timestamptz not null default now(),
  concluido_em timestamptz
);

create index on anuncios (produto_id);
create index on pedidos (user_id, vendido_em desc);
create index on eventos_sync (user_id, criado_em desc);

-- Cada vendedor só enxerga os próprios dados.
alter table contas_canal enable row level security;
alter table produtos enable row level security;
alter table anuncios enable row level security;
alter table pedidos enable row level security;
alter table eventos_sync enable row level security;

create policy "dono" on contas_canal for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "dono" on produtos for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "dono" on anuncios for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "dono" on pedidos for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "dono" on eventos_sync for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Valor do estoque em R$ (custo x quantidade) por vendedor.
create view valor_estoque with (security_invoker = true) as
select user_id,
       sum(quantidade) as pecas,
       sum(quantidade * custo_centavos) as valor_centavos
from produtos
group by user_id;
