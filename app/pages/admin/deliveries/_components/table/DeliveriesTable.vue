<script setup lang="ts">
import { getPaginationRowModel } from "@tanstack/vue-table";
import type { TableColumn } from "@nuxt/ui";
import type { Customer } from "~/types/customer";
import type { Delivery } from "~/types/delivery";
import type { Order } from "~/types/order";
import { formatCurrency, formatShortDateOrFallback } from "~/utils/format";
import { getDeliveryStatusBadge } from "~/pages/orders/_components/shared/delivery-status-badge";
import AdminTableEmptyState from "../../../_components/AdminTableEmptyState.vue";
import DeliveryRowActions from "./DeliveryRowActions.vue";

const table = useTemplateRef("table");

const props = defineProps<{
  deliveries: Delivery[];
  orders: Order[];
  customers: Customer[];
  search: string;
  status: string;
  isLoading: boolean;
  detailBasePath: string;
}>();

const orderById = computed(() =>
  new Map(props.orders.map((order) => [order.id, order])),
);

const customerById = computed(() =>
  new Map(props.customers.map((customer) => [customer.id, customer])),
);

const hasRows = computed(() => props.deliveries.length > 0);
const hasSearch = computed(() => props.search.trim().length > 0);
const hasStatusFilter = computed(() => props.status !== "all");

const emptyTitle = computed(() =>
  hasSearch.value || hasStatusFilter.value
    ? "No deliveries match the current filters"
    : "No deliveries yet",
);

const emptyDescription = computed(() =>
  hasSearch.value || hasStatusFilter.value
    ? "Try a different search term or status filter."
    : "Delivery records will appear here once orders begin moving into fulfillment.",
);

const resolveOrder = (orderId: string) => orderById.value.get(orderId) ?? null;
const orderDetailBasePath = computed(() =>
  props.detailBasePath.replace(/\/deliveries$/, "/orders"),
);

const resolveCustomer = (orderId: string) => {
  const order = resolveOrder(orderId);
  return order ? (customerById.value.get(order.customer_id) ?? null) : null;
};

const columns: TableColumn<Delivery>[] = [
  {
    id: "reference",
    header: "Delivery",
    accessorFn: (row) => row.id,
  },
  {
    id: "order",
    header: "Order",
    accessorFn: (row) => row.order_id,
  },
  {
    id: "customer",
    header: "Customer",
    accessorFn: (row) => resolveCustomer(row.order_id)?.id ?? "",
  },
  {
    id: "schedule",
    header: "Schedule",
    accessorFn: (row) => row.scheduled_at ?? row.delivered_at ?? row.updated_at,
  },
  {
    id: "status",
    header: "Status",
    accessorFn: (row) => row.status,
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
</script>

<template>
  <UCard>
    <UTable
      v-if="props.isLoading || hasRows"
      ref="table"
      v-model:pagination="pagination"
      :data="props.deliveries"
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
            Delivery {{ row.original.id }}
          </NuxtLink>
          <span class="text-xs text-slate-500">
            {{
              row.original.vehicle_number
                ? `Vehicle ${row.original.vehicle_number}`
                : row.original.driver_id
                  ? `Driver ${row.original.driver_id}`
                  : "Assignment pending"
            }}
          </span>
        </div>
      </template>

      <template #order-cell="{ row }">
        <div class="flex flex-col">
          <NuxtLink
            :to="`${orderDetailBasePath}/${row.original.order_id}`"
            class="font-medium text-slate-900 transition hover:text-primary"
          >
            Order {{ row.original.order_id }}
          </NuxtLink>
          <span class="text-xs text-slate-500">
            {{
              resolveOrder(row.original.order_id)
                ? formatCurrency(resolveOrder(row.original.order_id)?.total_amount ?? 0)
                : "Order summary unavailable"
            }}
          </span>
        </div>
      </template>

      <template #customer-cell="{ row }">
        <div class="flex flex-col">
          <span class="font-medium text-slate-900">
            {{
              resolveCustomer(row.original.order_id)?.company_name ??
              "Customer summary unavailable"
            }}
          </span>
          <span class="text-xs text-slate-500">
            {{
              resolveCustomer(row.original.order_id)?.contact_name ??
              resolveOrder(row.original.order_id)?.customer_id ??
              "Customer record unavailable"
            }}
          </span>
        </div>
      </template>

      <template #schedule-cell="{ row }">
        <div class="flex flex-col">
          <span class="font-medium text-slate-900">
            {{ formatShortDateOrFallback(row.original.scheduled_at, "Not scheduled") }}
          </span>
          <span class="text-xs text-slate-500">
            Delivered {{ formatShortDateOrFallback(row.original.delivered_at, "Not yet") }}
          </span>
        </div>
      </template>

      <template #status-cell="{ row }">
        <UBadge
          :color="getDeliveryStatusBadge(row.original.status).color"
          variant="subtle"
        >
          {{ getDeliveryStatusBadge(row.original.status).label }}
        </UBadge>
      </template>

      <template #actions-cell="{ row }">
        <div class="flex justify-end">
          <DeliveryRowActions
            :delivery="row.original"
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
