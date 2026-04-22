import type { Customer, CustomerType } from "~/types/customer";

export const CUSTOMER_TYPE_OPTIONS = [
  { label: "Customer", value: "customer" },
  { label: "Contractor", value: "contractor" },
] as const;

export const resolveCustomerType = (
  customer?: Pick<Customer, "customer_type"> | null,
): CustomerType => (customer?.customer_type === "contractor" ? "contractor" : "customer");

export const getCustomerTypeLabel = (value?: CustomerType | null) =>
  value === "contractor" ? "Contractor" : "Customer";

export const getCustomerTypeDescription = (value: CustomerType) =>
  value === "contractor"
    ? "Manage contractor records, contact details, and linked account context for project workflows."
    : "Manage customer records, contact details, and account context for admin and staff workflows.";

export const getCustomerTypeCreateLabel = (value: CustomerType) =>
  value === "contractor" ? "New Contractor" : "New Customer";

export const getCustomerTypeEmptyDescription = (value: CustomerType) =>
  value === "contractor"
    ? "Contractor records appear here when they are available in the system."
    : "Customer records appear here when they are available in the system.";

export const matchesCustomerType = (
  customer: Pick<Customer, "customer_type">,
  type: CustomerType,
) => resolveCustomerType(customer) === type;
