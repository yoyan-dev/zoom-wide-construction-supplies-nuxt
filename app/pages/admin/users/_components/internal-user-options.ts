import type { InternalUserRole, User } from "~/types/user";

export const INTERNAL_USER_ROLE_OPTIONS: Array<{
  label: string;
  value: InternalUserRole;
}> = [
  { label: "Admin", value: "admin" },
  { label: "Manager", value: "manager" },
  { label: "Staff", value: "staff" },
  { label: "Warehouse Manager", value: "warehouse_manager" },
  { label: "Finance", value: "finance" },
  { label: "Supplier", value: "supplier" },
  { label: "Auditor", value: "auditor" },
];

export const USER_STATUS_OPTIONS = [
  { label: "All statuses", value: "all" },
  { label: "Active only", value: "active" },
  { label: "Inactive only", value: "inactive" },
];

const INTERNAL_USER_ROLE_LABELS: Record<InternalUserRole, string> = {
  admin: "Admin",
  manager: "Manager",
  staff: "Staff",
  warehouse_manager: "Warehouse Manager",
  finance: "Finance",
  supplier: "Supplier",
  auditor: "Auditor",
};

export const getInternalUserRoleLabel = (role?: InternalUserRole | string | null) =>
  role && role in INTERNAL_USER_ROLE_LABELS
    ? INTERNAL_USER_ROLE_LABELS[role as InternalUserRole]
    : "Internal user";

export const getUserStatusLabel = (isActive?: boolean | null) =>
  isActive ? "Active" : "Inactive";

export const getUserStatusColor = (isActive?: boolean | null) =>
  isActive ? "success" : "warning";

export const isMatchingStatusFilter = (user: Pick<User, "is_active">, filter: string) => {
  if (filter === "active") {
    return user.is_active;
  }

  if (filter === "inactive") {
    return !user.is_active;
  }

  return true;
};
