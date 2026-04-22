import type { Supplier } from "~/types/supplier";

export const SUPPLIER_STATUS_OPTIONS = [
  { label: "All statuses", value: "all" },
  { label: "Active only", value: "active" },
  { label: "Inactive only", value: "inactive" },
];

export const isSupplierActive = (supplier: Pick<Supplier, "is_active">) =>
  supplier.is_active !== false;

export const getSupplierStatusLabel = (isActive?: boolean | null) =>
  isActive === false ? "Inactive" : "Active";

export const getSupplierStatusColor = (isActive?: boolean | null) =>
  isActive === false ? "warning" : "success";

export const isMatchingSupplierStatusFilter = (
  supplier: Pick<Supplier, "is_active">,
  filter: string,
) => {
  if (filter === "active") {
    return isSupplierActive(supplier);
  }

  if (filter === "inactive") {
    return !isSupplierActive(supplier);
  }

  return true;
};
