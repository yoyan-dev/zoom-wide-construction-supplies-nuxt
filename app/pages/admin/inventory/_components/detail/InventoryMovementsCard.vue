<script setup lang="ts">
import type { InventoryLog } from "~/types/inventory";
import type { Product } from "~/types/product";
import { formatNumber, formatShortDateOrFallback } from "~/utils/format";
import AdminTableEmptyState from "../../../_components/AdminTableEmptyState.vue";

type BadgeColor =
  | "primary"
  | "secondary"
  | "success"
  | "info"
  | "warning"
  | "error"
  | "neutral";

const props = defineProps<{
  product: Product;
  movements: InventoryLog[];
  warehouseName: string;
  isLoading: boolean;
}>();

const orderedMovements = computed(() =>
  [...props.movements].sort((left, right) => {
    return new Date(right.created_at).getTime() - new Date(left.created_at).getTime();
  }),
);

const movementBadge = (
  movementType: InventoryLog["movement_type"],
): { color: BadgeColor; label: string } => {
  switch (movementType) {
    case "in":
      return { color: "success", label: "Stock In" };
    case "out":
      return { color: "error", label: "Stock Out" };
    default:
      return { color: "warning", label: "Adjustment" };
  }
};
</script>

<template>
  <UCard>
    <div class="space-y-5">
      <div class="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p class="text-xs uppercase tracking-[0.18em] text-slate-500">
            Stock Movements
          </p>
          <h2 class="mt-2 text-xl font-semibold text-slate-900">
            Recent inventory activity
          </h2>
          <p class="mt-2 text-sm text-slate-600">
            Latest stock in, stock out, and adjustment entries for
            {{ props.product.name ?? "this product" }}.
          </p>
        </div>

        <div class="rounded-lg border border-slate-200/70 px-3 py-2 text-right">
          <p class="text-xs uppercase tracking-[0.18em] text-slate-500">
            Warehouse
          </p>
          <p class="mt-1 text-sm font-semibold text-slate-900">
            {{ props.warehouseName }}
          </p>
        </div>
      </div>

      <AdminTableEmptyState
        v-if="!props.isLoading && !orderedMovements.length"
        title="No movement history yet"
        description="Stock activity will appear here once inventory movements are recorded for this product."
      />

      <div
        v-else-if="props.isLoading && !orderedMovements.length"
        class="space-y-3"
      >
        <div
          v-for="index in 3"
          :key="index"
          class="rounded-xl border border-slate-200/70 p-4"
        >
          <div class="space-y-3">
            <USkeleton class="h-5 w-28" />
            <USkeleton class="h-4 w-48" />
            <USkeleton class="h-4 w-32" />
          </div>
        </div>
      </div>

      <div
        v-else
        class="space-y-3"
      >
        <div
          v-for="entry in orderedMovements"
          :key="entry.id"
          class="rounded-xl border border-slate-200/70 p-4"
        >
          <div class="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
            <div class="space-y-2">
              <div class="flex flex-wrap items-center gap-2">
                <UBadge :color="movementBadge(entry.movement_type).color" variant="subtle">
                  {{ movementBadge(entry.movement_type).label }}
                </UBadge>
                <span class="text-xs text-slate-500">
                  {{ formatShortDateOrFallback(entry.created_at, "_") }}
                </span>
              </div>

              <div class="space-y-1 text-sm text-slate-600">
                <p v-if="entry.note">
                  {{ entry.note }}
                </p>
                <p v-if="entry.reference_type || entry.reference_id">
                  Ref:
                  {{ entry.reference_type ?? "record" }}
                  <template v-if="entry.reference_id">
                    | {{ entry.reference_id }}
                  </template>
                </p>
                <p v-if="entry.created_by">
                  Logged by {{ entry.created_by }}
                </p>
              </div>
            </div>

            <div class="text-left md:text-right">
              <p class="text-xs uppercase tracking-[0.18em] text-slate-500">
                Quantity change
              </p>
              <p class="mt-1 text-lg font-semibold text-slate-900">
                {{ formatNumber(entry.quantity_change) }}
                {{ props.product.unit ?? "" }}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </UCard>
</template>
