export const reais = (centavos: number) =>
  (centavos / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

/** "1.234,56", "12,5" ou "12.50" -> centavos. Retorna null se inválido. */
export function paraCentavos(valor: string): number | null {
  const limpo = valor.replace(/[R$\s]/g, "");
  if (!limpo) return 0;
  const normalizado = limpo.includes(",")
    ? limpo.replace(/\./g, "").replace(",", ".")
    : limpo;
  const numero = Number(normalizado);
  if (!Number.isFinite(numero) || numero < 0) return null;
  return Math.round(numero * 100);
}

export const centavosParaCampo = (centavos: number) =>
  (centavos / 100).toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
