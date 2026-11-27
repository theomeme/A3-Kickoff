-- Registra uma venda feita fora das APIs (ex.: Enjoei) de forma atômica:
-- baixa 1 unidade do produto, grava o pedido e, se o estoque zerar,
-- agenda a pausa dos anúncios ativos nos outros canais.
create or replace function registrar_venda_manual(
  p_produto_id uuid,
  p_canal canal,
  p_bruto_centavos integer default 0,
  p_taxas_centavos integer default 0
) returns integer
language plpgsql
security invoker
as $$
declare
  v_user uuid := auth.uid();
  v_restante integer;
  v_anuncio uuid;
  v_pedido uuid;
begin
  update produtos
     set quantidade = quantidade - 1, atualizado_em = now()
   where id = p_produto_id and user_id = v_user and quantidade > 0
  returning quantidade into v_restante;

  if v_restante is null then
    raise exception 'sem_estoque';
  end if;

  select id into v_anuncio
    from anuncios
   where produto_id = p_produto_id and canal = p_canal
   limit 1;

  insert into pedidos (user_id, canal, id_externo, anuncio_id, quantidade,
                       bruto_centavos, taxas_centavos, vendido_em)
  values (v_user, p_canal, 'manual-' || gen_random_uuid(), v_anuncio, 1,
          p_bruto_centavos, p_taxas_centavos, now())
  returning id into v_pedido;

  if v_restante = 0 then
    update anuncios set status = 'pausado', atualizado_em = now()
     where id = v_anuncio;

    insert into eventos_sync (user_id, pedido_id, anuncio_id, acao, status)
    select v_user, v_pedido, a.id,
           case when a.canal = 'enjoei' then 'alertar_enjoei' else 'pausar' end,
           case when a.canal = 'enjoei' then 'alerta_manual'::status_sync else 'pendente'::status_sync end
      from anuncios a
     where a.produto_id = p_produto_id
       and a.status = 'ativo'
       and a.id is distinct from v_anuncio;
  end if;

  return v_restante;
end;
$$;
