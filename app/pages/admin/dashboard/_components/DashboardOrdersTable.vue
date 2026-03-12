<script setup lang="ts">
import type { TableColumn } from "@nuxt/ui";
import type { DashboardOrderRow } from "~/types/dashboard";
import { formatCurrency, formatShortDate } from "~/utils/format";

const props = defineProps<{
  rows: DashboardOrderRow[];
}>();

type BadgeColor =
  | "primary"
  | "secondary"
  | "success"
  | "info"
  | "warning"
  | "error"
  | "neutral";

const statusTone: Record<DashboardOrderRow["order"]["status"], BadgeColor> = {
  pending: "warning",
  approved: "info",
  rejected: "error",
  cancelled: "neutral",
  completed: "success",
};

const deliveryTone: Record<DashboardOrderRow["delivery_status"], BadgeColor> = {
  scheduled: "warning",
  in_transit: "info",
  delivered: "success",
  failed: "error",
  unassigned: "neutral",
};

const columns: TableColumn<DashboardOrderRow>[] = [
  {
    id: "order",
    header: "Order",
    accessorFn: (row) => row.order.id,
  },
  {
    id: "customer",
    header: "Customer",
    accessorFn: (row) => row.customer.company_name,
  },
  {
    id: "total",
    header: "Total",
    accessorFn: (row) => row.order.total_amount,
  },
  {
    id: "status",
    header: "Status",
    accessorFn: (row) => row.order.status,
  },
  {
    id: "delivery",
    header: "Delivery",
    accessorFn: (row) => row.delivery_status,
  },
  {
    id: "placed",
    header: "Placed",
    accessorFn: (row) => row.order.created_at,
  },
];
</script>

<template>
  <UCard>
    <div class="mb-4 flex items-center justify-between">
      <div>
        <p class="text-xs uppercase tracking-[0.18em] text-slate-500">
          Recent Orders
        </p>
        <p class="mt-1 text-lg font-semibold">Workflow spotlight</p>
      </div>
      <UButton color="neutral" variant="ghost" icon="i-lucide-arrow-right">
        View All
      </UButton>
    </div>

    <UTable :data="props.rows" :columns="columns" class="text-sm">
      <template #order-cell="{ row }">
        <div class="flex flex-col">
          <span class="font-medium">
            {{ row.original.order.id }}
          </span>
          <span class="text-xs text-slate-500">
            {{ row.original.items }} items
          </span>
        </div>
      </template>
      <template #customer-cell="{ row }">
        <div class="flex flex-col">
          <span class="font-medium">
            {{ row.original.customer.company_name }}
          </span>
          <span class="text-xs text-slate-500">
            {{ row.original.customer.contact_name }}
          </span>
        </div>
      </template>
      <template #total-cell="{ row }">
        <span class="font-medium">
          {{ formatCurrency(row.original.order.total_amount) }}
        </span>
      </template>
      <template #status-cell="{ row }">
        <UBadge :color="statusTone[row.original.order.status]" variant="subtle">
          {{ row.original.order.status }}
        </UBadge>
      </template>
      <template #delivery-cell="{ row }">
        <UBadge
          :color="deliveryTone[row.original.delivery_status]"
          variant="subtle"
        >
          {{ row.original.delivery_status }}
        </UBadge>
      </template>
      <template #placed-cell="{ row }">
        <span class="text-slate-600">
          {{ formatShortDate(row.original.order.created_at) }}
        </span>
      </template>
    </UTable>
  </UCard>
</template>
