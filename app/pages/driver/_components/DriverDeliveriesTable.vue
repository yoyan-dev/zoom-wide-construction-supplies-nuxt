<script setup lang="ts">
import { getPaginationRowModel } from "@tanstack/vue-table";
import type { TableColumn } from "@nuxt/ui";
import type { DriverAssignedOrder } from "~/types/order";
import { formatCurrency, formatShortDateOrFallback } from "~/utils/format";
import { getDeliveryStatusBadge } from "~/pages/orders/_components/shared/delivery-status-badge";
import AdminTableEmptyState from "~/pages/admin/_components/AdminTableEmptyState.vue";
import DriverDeliveryRowActions from "./DriverDeliveryRowActions.vue";

const table = useTemplateRef("table");

const props = defineProps<{
  orders: DriverAssignedOrder[];
  isLoading: boolean;
  scope: "assigned" | "completed";
  driverId: string;
}>();

const emit = defineEmits<{
  (e: "updated"): void;
}>();

const columns: TableColumn<DriverAssignedOrder>[] = [
  {
    id: "reference",
    header: "Assigned Order",
    accessorFn: (row) => row.id,
  },
  {
    id: "amount",
    header: "Amount",
    accessorFn: (row) => row.total_amount,
  },
  {
    id: "schedule",
    header: "Schedule",
    accessorFn: (row) => row.delivery?.scheduled_at ?? row.updated_at,
  },
  {
    id: "status",
    header: "Delivery Status",
    accessorFn: (row) => row.delivery?.status ?? row.status,
  },
  {
    id: "actions",
    header: "",
  },
];

const pagination = ref({
  pageIndex: 0,
  pageSize: 8,
});

const hasRows = computed(() => props.orders.length > 0);

const emptyTitle = computed(() =>
  props.scope === "assigned"
    ? "No active delivery jobs"
    : "No completed delivery jobs",
);

const emptyDescription = computed(() =>
  props.scope === "assigned"
    ? "Assigned orders waiting for delivery will appear here."
    : "Completed delivery jobs will appear here once you finish an assigned order.",
);

const getAssignmentText = (order: DriverAssignedOrder) => {
  const delivery = order.delivery;

  if (delivery?.vehicle_number) {
    return `Vehicle ${delivery.vehicle_number}`;
  }

  if (delivery?.driver_id === props.driverId) {
    return "Assigned to you";
  }

  return "Delivery details unavailable";
};
</script>

<template>
  <div class="space-y-4">
    <div v-if="props.isLoading || hasRows" class="hidden md:block">
      <UCard>
        <UTable
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
              <span class="font-medium text-slate-900">
                Order {{ row.original.id }}
              </span>
              <span class="text-xs text-slate-500">
                {{ getAssignmentText(row.original) }}
              </span>
            </div>
          </template>

          <template #amount-cell="{ row }">
            <div class="flex flex-col">
              <span class="font-medium text-slate-900">
                {{ formatCurrency(row.original.total_amount ?? 0) }}
              </span>
              <span class="text-xs text-slate-500">
                {{ row.original.notes ? "Delivery notes available" : "No delivery notes" }}
              </span>
            </div>
          </template>

          <template #schedule-cell="{ row }">
            <div class="flex flex-col">
              <span class="font-medium text-slate-900">
                {{
                  formatShortDateOrFallback(
                    row.original.delivery?.scheduled_at,
                    "Not scheduled",
                  )
                }}
              </span>
              <span class="text-xs text-slate-500">
                Delivered
                {{
                  formatShortDateOrFallback(
                    row.original.delivery?.delivered_at,
                    "Not yet",
                  )
                }}
              </span>
            </div>
          </template>

          <template #status-cell="{ row }">
            <UBadge
              :color="getDeliveryStatusBadge(row.original.delivery?.status ?? 'scheduled').color"
              variant="subtle"
            >
              {{ getDeliveryStatusBadge(row.original.delivery?.status ?? "scheduled").label }}
            </UBadge>
          </template>

          <template #actions-cell="{ row }">
            <div class="flex justify-end">
              <DriverDeliveryRowActions
                :order="row.original"
                :scope="props.scope"
                :driver-id="props.driverId"
                @updated="emit('updated')"
              />
            </div>
          </template>
        </UTable>

        <div
          v-if="hasRows"
          class="flex justify-end border-t border-default px-4 pt-4"
        >
          <UPagination
            :page="(table?.tableApi?.getState().pagination.pageIndex || 0) + 1"
            :items-per-page="table?.tableApi?.getState().pagination.pageSize"
            :total="table?.tableApi?.getFilteredRowModel().rows.length"
            @update:page="(p) => table?.tableApi?.setPageIndex(p - 1)"
          />
        </div>
      </UCard>
    </div>

    <div v-if="props.isLoading && !hasRows" class="space-y-3 md:hidden">
      <UCard v-for="index in 2" :key="index">
        <div class="space-y-4">
          <div class="flex items-start justify-between gap-3">
            <div class="min-w-0 flex-1 space-y-2">
              <USkeleton class="h-4 w-32" />
              <USkeleton class="h-3 w-40" />
            </div>
            <USkeleton class="h-6 w-20 rounded-full" />
          </div>
          <div class="grid gap-3 sm:grid-cols-2">
            <div class="space-y-2">
              <USkeleton class="h-3 w-16" />
              <USkeleton class="h-4 w-28" />
            </div>
            <div class="space-y-2">
              <USkeleton class="h-3 w-16" />
              <USkeleton class="h-4 w-28" />
            </div>
          </div>
        </div>
      </UCard>
    </div>

    <div v-else-if="hasRows" class="space-y-3 md:hidden">
      <UCard
        v-for="order in props.orders"
        :key="order.id"
      >
        <div class="flex items-start justify-between gap-3">
          <div class="min-w-0">
            <p class="text-sm font-semibold text-slate-900">
              Order {{ order.id }}
            </p>
            <p class="mt-1 text-xs text-slate-500">
              {{ getAssignmentText(order) }}
            </p>
          </div>

          <UBadge
            :color="getDeliveryStatusBadge(order.delivery?.status ?? 'scheduled').color"
            variant="subtle"
          >
            {{ getDeliveryStatusBadge(order.delivery?.status ?? "scheduled").label }}
          </UBadge>
        </div>

        <div class="mt-4 grid gap-3 sm:grid-cols-2">
          <div>
            <p class="text-xs uppercase tracking-[0.18em] text-slate-500">
              Amount
            </p>
            <p class="mt-1 text-sm font-medium text-slate-900">
              {{ formatCurrency(order.total_amount ?? 0) }}
            </p>
          </div>

          <div>
            <p class="text-xs uppercase tracking-[0.18em] text-slate-500">
              Scheduled
            </p>
            <p class="mt-1 text-sm font-medium text-slate-900">
              {{ formatShortDateOrFallback(order.delivery?.scheduled_at, "Not scheduled") }}
            </p>
          </div>
        </div>

        <div class="mt-4 flex justify-end">
          <DriverDeliveryRowActions
            :order="order"
            :scope="props.scope"
            :driver-id="props.driverId"
            @updated="emit('updated')"
          />
        </div>
      </UCard>
    </div>

    <AdminTableEmptyState
      v-if="!props.isLoading && !hasRows"
      :title="emptyTitle"
      :description="emptyDescription"
    />
  </div>
</template>
