export const warehouseOptions = [
  "Central Warehouse",
  "North Distribution",
  "South Yard",
  "East Storage",
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

export const isAssignedWarehouse = (
  warehouse: string,
  assigned: string[] = defaultAssignedWarehouses,
) => assigned.includes(warehouse);
