type BadgeColor =
  | "primary"
  | "secondary"
  | "success"
  | "info"
  | "warning"
  | "error"
  | "neutral";

export type InventoryStockState = {
  color: BadgeColor;
  label: string;
  description: string;
};

export const getInventoryStockState = (
  currentStock: number,
  minimumStock = 0,
): InventoryStockState => {
  if (currentStock === 0) {
    return {
      color: "error",
      label: "Out of stock",
      description: "This item has no stock remaining and needs immediate attention.",
    };
  }

  if (currentStock <= minimumStock) {
    return {
      color: "warning",
      label: "Low stock",
      description: "Stock is at or below the configured minimum threshold.",
    };
  }

  return {
    color: "success",
    label: "Healthy stock",
    description: "Stock is currently above the configured minimum threshold.",
  };
};
