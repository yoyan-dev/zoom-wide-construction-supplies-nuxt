<script setup lang="ts">
import { getPaginationRowModel } from "@tanstack/vue-table";
import type { TableColumn } from "@nuxt/ui";
import type { Customer } from "~/types/customer";
import type { Order, OrderStatus } from "~/types/order";
import { formatCurrency, formatShortDate } from "~/utils/format";

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
}>();

const customerMap = computed(() => {
  const map: Record<string, Customer> = {};
  for (const customer of props.customers) {
    map[customer.id] = customer;
  }
  return map;
});

const statusTone: Record<OrderStatus, BadgeColor> = {
  pending: "warning",
  approved: "info",
  completed: "success",
  rejected: "error",
  cancelled: "neutral",
};

const columns: TableColumn<Order>[] = [
  {
    id: "order",
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
    id: "total",
    header: "Total",
    accessorFn: (row) => row.total_amount,
  },
  {
    id: "created",
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
  pageSize: 5,
});
</script>

<template>
  <UCard>
    <div class="mb-4 flex items-center justify-between">
      <div>
        <p class="text-xs uppercase tracking-[0.18em] text-slate-500">
          Order Queue
        </p>
        <p class="mt-1 text-lg font-semibold">Order overview</p>
      </div>
      <UButton color="neutral" variant="ghost" icon="i-lucide-filter">
        Filters
      </UButton>
    </div>

    <UTable
      ref="table"
      v-model:pagination="pagination"
      :data="props.orders"
      :columns="columns"
      class="text-sm"
      :pagination-options="{
        getPaginationRowModel: getPaginationRowModel(),
      }"
    >
      <template #order-cell="{ row }">
        <div class="flex flex-col">
          <span class="font-medium">{{ row.original.id }}</span>
          <span class="text-xs text-slate-500">
            {{ row.original.notes ?? "No notes" }}
          </span>
        </div>
      </template>
      <template #customer-cell="{ row }">
        <div class="flex flex-col">
          <span class="font-medium">
            {{ customerMap[row.original.customer_id]?.company_name ?? "Unknown" }}
          </span>
          <span class="text-xs text-slate-500">
            {{ customerMap[row.original.customer_id]?.contact_name ?? "—" }}
          </span>
        </div>
      </template>
      <template #status-cell="{ row }">
        <UBadge :color="statusTone[row.original.status]" variant="subtle">
          {{ row.original.status }}
        </UBadge>
      </template>
      <template #total-cell="{ row }">
        <span class="font-medium">
          {{ formatCurrency(row.original.total_amount) }}
        </span>
      </template>
      <template #created-cell="{ row }">
        <span class="text-slate-600">
          {{ formatShortDate(row.original.created_at) }}
        </span>
      </template>
      <template #actions-cell="{ row }">
        <div class="flex justify-end">
          <UButton color="neutral" variant="ghost" size="sm">
            View
          </UButton>
        </div>
      </template>
    </UTable>
    <div class="flex justify-end border-t border-default pt-4 px-4">
      <UPagination
        :page="(table?.tableApi?.getState().pagination.pageIndex || 0) + 1"
        :items-per-page="table?.tableApi?.getState().pagination.pageSize"
        :total="table?.tableApi?.getFilteredRowModel().rows.length"
        @update:page="(p) => table?.tableApi?.setPageIndex(p - 1)"
      />
    </div>
  </UCard>
</template>
