<script setup lang="ts">
import { getPaginationRowModel } from "@tanstack/vue-table";
import type { TableColumn } from "@nuxt/ui";
import type { Customer } from "~/types/customer";
import type { Order } from "~/types/order";
import { formatCurrency, formatShortDateOrFallback } from "~/utils/format";
import AdminTableEmptyState from "../../../_components/AdminTableEmptyState.vue";
import OrderRowActions from "./OrderRowActions.vue";

type BadgeColor =
  | "primary"
  | "secondary"
  | "success"
  | "info"
  | "warning"
  | "error"
  | "neutral";

const table = useTemplateRef("table");

const props = defineProps<{
  orders: Order[];
  customers: Customer[];
  search: string;
  status: string;
  detailBasePath: string;
  isLoading: boolean;
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

const pagination = ref({
  pageIndex: 0,
  pageSize: 10,
});

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
</script>

<template>
  <UCard class="rounded-[24px] border border-slate-200/70 bg-white/95 shadow-sm">
    <UTable
      v-if="props.isLoading || hasRows"
      ref="table"
      v-model:pagination="pagination"
      :data="props.orders"
      :columns="columns"
      class="text-sm"
      :pagination-options="{
        getPaginationRowModel: getPaginationRowModel(),
      }"
      :loading="props.isLoading"
    >
      <template #reference-cell="{ row }">
        <div class="flex flex-col">
          <NuxtLink
            :to="`${props.detailBasePath}/${row.original.id}`"
            class="font-medium text-slate-900 transition hover:text-primary"
          >
            Order {{ row.original.id }}
          </NuxtLink>
          <span class="text-xs text-slate-500">
            Updated {{ formatShortDateOrFallback(row.original.updated_at) }}
          </span>
        </div>
      </template>

      <template #customer-cell="{ row }">
        <div class="flex flex-col">
          <span class="font-medium text-slate-900">
            {{
              resolveCustomer(row.original.customer_id)?.company_name ??
              "Customer record unavailable"
            }}
          </span>
          <span class="text-xs text-slate-500">
            {{
              resolveCustomer(row.original.customer_id)?.contact_name ??
              row.original.customer_id
            }}
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
            {{ formatShortDateOrFallback(row.original.updated_at) }}
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
  </UCard>
</template>
