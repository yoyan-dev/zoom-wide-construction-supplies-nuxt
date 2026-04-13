import type { Warehouse, WarehouseStatus } from "~/types/warehouse";

export const WAREHOUSE_STATUS_OPTIONS = [
  { label: "All statuses", value: "all" },
  { label: "Active", value: "active" },
  { label: "Inactive", value: "inactive" },
  { label: "Archived", value: "archived" },
];

export const WAREHOUSE_FORM_STATUS_OPTIONS = [
  { label: "Active", value: "active" },
  { label: "Inactive", value: "inactive" },
  { label: "Archived", value: "archived" },
];

export const getWarehouseStatusLabel = (status?: WarehouseStatus | null) => {
  switch (status) {
    case "active":
      return "Active";
    case "inactive":
      return "Inactive";
    case "archived":
      return "Archived";
    default:
      return "Unknown";
  }
};

export const getWarehouseStatusColor = (status?: WarehouseStatus | null) => {
  switch (status) {
    case "active":
      return "success";
    case "inactive":
      return "warning";
    case "archived":
      return "neutral";
    default:
      return "neutral";
  }
};

export const isMatchingWarehouseStatusFilter = (
  warehouse: Warehouse,
  status: string,
) => status === "all" || warehouse.status === status;
