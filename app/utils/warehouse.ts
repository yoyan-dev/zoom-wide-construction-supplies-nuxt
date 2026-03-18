import type { Warehouse } from "~/types/warehouse";

export const warehouseOptions = [
  "Central Warehouse",
  "North Distribution",
  "South Yard",
  "East Storage",
];

export const warehouseIdOptions = [
  "wh-central",
  "wh-north",
  "wh-south",
  "wh-east",
];

export const defaultAssignedWarehouses = ["Central Warehouse"];

export const getWarehouseForId = (
  id: string,
  options: string[] = warehouseOptions,
) => {
  if (!id) return options[0];
  let hash = 0;
  for (const char of id) {
    hash = (hash + char.charCodeAt(0)) % options.length;
  }
  return options[hash];
};

export const getDefaultWarehouseIdForProduct = (
  id: string,
  options: string[] = warehouseIdOptions,
) => {
  if (!id) return options[0];
  let hash = 0;
  for (const char of id) {
    hash = (hash + char.charCodeAt(0)) % options.length;
  }
  return options[hash];
};

export const getWarehouseNameById = (
  warehouseId?: string | null,
  warehouses: Array<Pick<Warehouse, "id" | "name">> = [],
) => {
  if (!warehouseId) return null;
  return warehouses.find((warehouse) => warehouse.id === warehouseId)?.name ?? null;
};

export const isAssignedWarehouse = (
  warehouse: string,
  assigned: string[] = defaultAssignedWarehouses,
) => assigned.includes(warehouse);
