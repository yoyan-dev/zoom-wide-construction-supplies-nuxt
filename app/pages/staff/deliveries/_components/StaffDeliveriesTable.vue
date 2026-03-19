<script setup lang="ts">
import { getPaginationRowModel } from "@tanstack/vue-table";
import type { TableColumn } from "@nuxt/ui";
import type { Customer } from "~/types/customer";
import type { Delivery, DeliveryStatus } from "~/types/delivery";
import type { Driver } from "~/types/driver";
import type { Order } from "~/types/order";
import { formatShortDate } from "~/utils/format";

type BadgeColor =
  | "primary"
  | "secondary"
  | "success"
  | "info"
  | "warning"
  | "error"
  | "neutral";

const props = defineProps<{
  deliveries: Delivery[];
  driversById: Record<string, Driver>;
  ordersById: Record<string, Order>;
  customersById: Record<string, Customer>;
}>();

const table = useTemplateRef("table");

const statusTone: Record<DeliveryStatus, BadgeColor> = {
  scheduled: "warning",
  in_transit: "info",
  delivered: "success",
  failed: "error",
  cancelled: "neutral",
};

const columns: TableColumn<Delivery>[] = [
  { id: "delivery", header: "Delivery", accessorFn: (row) => row.id },
  { id: "order", header: "Order", accessorFn: (row) => row.order_id },
  { id: "customer", header: "Customer", accessorFn: (row) => row.order_id },
  { id: "driver", header: "Driver", accessorFn: (row) => row.driver_id ?? "" },
  { id: "status", header: "Status", accessorFn: (row) => row.status },
  { id: "schedule", header: "Schedule", accessorFn: (row) => row.scheduled_at ?? "" },
];

const pagination = ref({
  pageIndex: 0,
  pageSize: 6,
});

const customerLabel = (delivery: Delivery) => {
  const order = props.ordersById[delivery.order_id];
  if (!order) return "Customer pending";
  return props.customersById[order.customer_id]?.company_name ?? order.customer_id;
};
</script>

<template>
  <UCard>
    <div class="mb-4 flex flex-wrap items-center justify-between gap-3">
      <div>
        <p class="text-xs uppercase tracking-[0.18em] text-slate-500">
          Dispatch Board
        </p>
        <p class="mt-1 text-lg font-semibold">Delivery status and routing</p>
      </div>
      <UBadge color="info" variant="subtle">
        {{ props.deliveries.length }} delivery records
      </UBadge>
    </div>

    <UTable
      ref="table"
      v-model:pagination="pagination"
      :data="props.deliveries"
      :columns="columns"
      class="text-sm"
      :pagination-options="{ getPaginationRowModel: getPaginationRowModel() }"
    >
      <template #delivery-cell="{ row }">
        <div class="flex flex-col">
          <span class="font-medium text-slate-900">{{ row.original.id }}</span>
          <span class="text-xs text-slate-500">
            {{ row.original.vehicle_number ?? "Vehicle pending" }}
          </span>
        </div>
      </template>

      <template #order-cell="{ row }">
        <span class="text-slate-700">{{ row.original.order_id }}</span>
      </template>

      <template #customer-cell="{ row }">
        <span class="text-slate-700">{{ customerLabel(row.original) }}</span>
      </template>

      <template #driver-cell="{ row }">
        <div class="flex flex-col">
          <span class="text-slate-700">
            {{
              props.driversById[row.original.driver_id ?? ""]?.name ??
              "Driver pending"
            }}
          </span>
          <span class="text-xs text-slate-500">
            {{
              props.driversById[row.original.driver_id ?? ""]?.vehicle_number ??
              row.original.vehicle_number ??
              "No vehicle"
            }}
          </span>
        </div>
      </template>

      <template #status-cell="{ row }">
        <UBadge :color="statusTone[row.original.status]" variant="subtle">
          {{ row.original.status.replace("_", " ") }}
        </UBadge>
      </template>

      <template #schedule-cell="{ row }">
        <span class="text-slate-600">
          {{ row.original.scheduled_at ? formatShortDate(row.original.scheduled_at) : "TBD" }}
        </span>
      </template>
    </UTable>

    <div class="flex justify-end border-t border-default px-4 pt-4">
      <UPagination
        :page="(table?.tableApi?.getState().pagination.pageIndex || 0) + 1"
        :items-per-page="table?.tableApi?.getState().pagination.pageSize"
        :total="table?.tableApi?.getFilteredRowModel().rows.length"
        @update:page="(page) => table?.tableApi?.setPageIndex(page - 1)"
      />
    </div>
  </UCard>
</template>
