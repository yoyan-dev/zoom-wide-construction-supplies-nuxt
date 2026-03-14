<script setup lang="ts">
import { getPaginationRowModel } from "@tanstack/vue-table";
import type { TableColumn } from "@nuxt/ui";
import type { Delivery, DeliveryStatus } from "~/types/delivery";
import type { Driver } from "~/types/driver";
import { formatShortDate } from "~/utils/format";

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
  deliveries: Delivery[];
  drivers: Driver[];
}>();

const driverMap = computed(() => {
  const map: Record<string, Driver> = {};
  for (const driver of props.drivers) {
    map[driver.id] = driver;
  }
  return map;
});

const statusTone: Record<DeliveryStatus, BadgeColor> = {
  scheduled: "warning",
  in_transit: "info",
  delivered: "success",
  failed: "error",
};

const columns: TableColumn<Delivery>[] = [
  {
    id: "delivery",
    header: "Delivery",
    accessorFn: (row) => row.id,
  },
  {
    id: "order",
    header: "Order",
    accessorFn: (row) => row.order_id,
  },
  {
    id: "driver",
    header: "Driver",
    accessorFn: (row) => row.driver_id ?? "Unassigned",
  },
  {
    id: "status",
    header: "Status",
    accessorFn: (row) => row.status,
  },
  {
    id: "scheduled",
    header: "Scheduled",
    accessorFn: (row) => row.scheduled_at ?? "",
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
          Dispatch Board
        </p>
        <p class="mt-1 text-lg font-semibold">Delivery overview</p>
      </div>
      <UButton color="neutral" variant="ghost" icon="i-lucide-filter">
        Filters
      </UButton>
    </div>

    <UTable
      ref="table"
      v-model:pagination="pagination"
      :data="props.deliveries"
      :columns="columns"
      class="text-sm"
      :pagination-options="{
        getPaginationRowModel: getPaginationRowModel(),
      }"
    >
      <template #delivery-cell="{ row }">
        <div class="flex flex-col">
          <span class="font-medium">{{ row.original.id }}</span>
          <span class="text-xs text-slate-500">
            {{
              driverMap[row.original.driver_id ?? ""]?.vehicle_number ??
                row.original.vehicle_number ??
                "Vehicle TBA"
            }}
          </span>
        </div>
      </template>
      <template #order-cell="{ row }">
        <span class="text-slate-700">{{ row.original.order_id }}</span>
      </template>
      <template #driver-cell="{ row }">
        <div class="flex flex-col">
          <span class="text-slate-700">
            {{
              driverMap[row.original.driver_id ?? ""]?.name ?? "Unassigned"
            }}
          </span>
          <span class="text-xs text-slate-500">
            {{
              driverMap[row.original.driver_id ?? ""]?.vehicle_number ??
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
      <template #scheduled-cell="{ row }">
        <span class="text-slate-600">
          {{
            row.original.scheduled_at
              ? formatShortDate(row.original.scheduled_at)
              : "TBD"
          }}
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
