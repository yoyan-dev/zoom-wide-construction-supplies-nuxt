<script setup lang="ts">
import type { TableColumn } from "@nuxt/ui";
import type { Customer } from "~/types/customer";
import type { Order } from "~/types/order";
import type { PaginationMeta } from "~/types/pagination";
import { formatCurrency, formatShortDateOrFallback } from "~/utils/format";
import AdminTableEmptyState from "../../../_components/AdminTableEmptyState.vue";
import AdminServerPagination from "../../../_components/AdminServerPagination.vue";
import OrderRowActions from "./OrderRowActions.vue";

type BadgeColor =
  | "primary"
  | "secondary"
  | "success"
  | "info"
  | "warning"
  | "error"
  | "neutral";

const props = defineProps<{
  orders: Order[];
  customers: Customer[];
  search: string;
  status: string;
  detailBasePath: string;
  isLoading: boolean;
  pagination: PaginationMeta;
}>();

const emit = defineEmits<{
  (event: "page-change", page: number): void;
}>();

const customerById = computed(() =>
  new Map(props.customers.map((customer) => [customer.id, customer])),
);

const hasRows = computed(() => props.orders.length > 0);
const hasSearch = computed(() => props.search.trim().length > 0);
const hasStatusFilter = computed(() => props.status !== "all");

const emptyTitle = computed(() =>
  hasSearch.value || hasStatusFilter.value
    ? "No orders match the current filters"
    : "No orders yet",
);

const emptyDescription = computed(() =>
  hasSearch.value || hasStatusFilter.value
    ? "Try a different search term or status filter."
    : "Submitted customer orders will appear here once they are available in the system.",
);

const columns: TableColumn<Order>[] = [
  {
    id: "reference",
    header: "Order",
    accessorFn: (row) => row.id,
  },
  {
    id: "customer",
    header: "Customer",
    accessorFn: (row) => row.customer_id,
  },
  {
    id: "status",
    header: "Status",
    accessorFn: (row) => row.status,
  },
  {
    id: "amount",
    header: "Amount",
    accessorFn: (row) => row.total_amount,
  },
  {
    id: "date",
    header: "Created",
    accessorFn: (row) => row.created_at,
  },
  {
    id: "actions",
    header: "",
  },
];

const statusBadge = (
  order: Order,
): { color: BadgeColor; label: string } => {
  switch (order.status) {
    case "approved":
      return { color: "success", label: "Approved" };
    case "rejected":
      return { color: "error", label: "Rejected" };
    case "cancelled":
      return { color: "neutral", label: "Cancelled" };
    case "completed":
      return { color: "info", label: "Completed" };
    default:
      return { color: "warning", label: "Pending" };
  }
};

const resolveCustomer = (customerId: string) =>
  customerById.value.get(customerId) ?? null;

const getCustomerDisplayName = (customerId: string) => {
  const customer = resolveCustomer(customerId);
  return (
    customer?.company_name ??
    customer?.contact_name ??
    "Customer order"
  );
};

const getCustomerSupportText = (customerId: string) => {
  const customer = resolveCustomer(customerId);

  if (customer?.company_name && customer?.contact_name) {
    return customer.contact_name;
  }

  return customer?.email ?? customer?.phone ?? "Contact details unavailable";
};
</script>

<template>
  <UCard>
    <UTable
      v-if="props.isLoading || hasRows"
      :data="props.orders"
      :columns="columns"
      class="text-sm"
      :loading="props.isLoading"
    >
      <template #reference-cell="{ row }">
        <div class="flex flex-col">
          <NuxtLink
            :to="`${props.detailBasePath}/${row.original.id}`"
            class="font-medium text-slate-900 transition hover:text-primary"
          >
            Order for {{ getCustomerDisplayName(row.original.customer_id) }}
          </NuxtLink>
          <span class="text-xs text-slate-500">
            Placed {{ formatShortDateOrFallback(row.original.created_at) }}
          </span>
        </div>
      </template>

      <template #customer-cell="{ row }">
        <div class="flex flex-col">
          <span class="font-medium text-slate-900">
            {{ getCustomerDisplayName(row.original.customer_id) }}
          </span>
          <span class="text-xs text-slate-500">
            {{ getCustomerSupportText(row.original.customer_id) }}
          </span>
        </div>
      </template>

      <template #status-cell="{ row }">
        <UBadge :color="statusBadge(row.original).color" variant="soft">
          {{ statusBadge(row.original).label }}
        </UBadge>
      </template>

      <template #amount-cell="{ row }">
        <div class="flex flex-col">
          <span class="font-medium text-slate-900">
            {{ formatCurrency(row.original.total_amount ?? 0) }}
          </span>
          <span class="text-xs text-slate-500">
            {{ row.original.notes ? "Notes available" : "No notes" }}
          </span>
        </div>
      </template>

      <template #date-cell="{ row }">
        <div class="flex flex-col">
          <span class="font-medium text-slate-900">
            {{ formatShortDateOrFallback(row.original.created_at) }}
          </span>
          <span class="text-xs text-slate-500">
            Updated {{ formatShortDateOrFallback(row.original.updated_at) }}
          </span>
        </div>
      </template>

      <template #actions-cell="{ row }">
        <div class="flex justify-end">
          <OrderRowActions
            :order="row.original"
            :detail-base-path="props.detailBasePath"
          />
        </div>
      </template>
    </UTable>

    <AdminTableEmptyState
      v-else
      :title="emptyTitle"
      :description="emptyDescription"
    />
    <AdminServerPagination
      v-if="hasRows"
      :pagination="props.pagination"
      @page-change="emit('page-change', $event)"
    />
  </UCard>
</template>
