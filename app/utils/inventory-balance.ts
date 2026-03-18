import type { InventoryLog } from "~/types/inventory";

export const getInventoryBalance = (
  logs: InventoryLog[],
  productId?: string | null,
  fallback = 0,
) => {
  if (!productId) return fallback;

  const productLogs = logs.filter((entry) => entry.product_id === productId);
  if (!productLogs.length) return fallback;

  return productLogs.reduce(
    (total, entry) => total + (entry.quantity_change ?? 0),
    0,
  );
};

export const buildInventoryBalanceMap = (
  logs: InventoryLog[],
  products?: Array<{ id?: string; stock_quantity?: number }>,
) => {
  const balances: Record<string, number> = {};

  for (const product of products ?? []) {
    if (!product.id) continue;
    balances[product.id] = product.stock_quantity ?? 0;
  }

  for (const entry of logs) {
    if (!entry.product_id) continue;
    balances[entry.product_id] = (balances[entry.product_id] ?? 0) + entry.quantity_change;
  }

  return balances;
};
