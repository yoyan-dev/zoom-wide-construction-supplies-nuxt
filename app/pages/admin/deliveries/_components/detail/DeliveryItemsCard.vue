<script setup lang="ts">
import type { OrderItem } from "~/types/order";
import { formatCurrency } from "~/utils/format";

const props = defineProps<{
  items: OrderItem[];
}>();

const totalUnits = computed(() =>
  props.items.reduce((sum, item) => sum + item.quantity, 0),
);
</script>

<template>
  <UCard>
    <div class="flex flex-wrap items-center justify-between gap-4">
      <div>
        <p class="text-xs uppercase tracking-[0.18em] text-slate-500">
          Shipment Summary
        </p>
        <h2 class="mt-2 text-xl font-semibold text-slate-900">
          Linked order items
        </h2>
      </div>

      <UBadge color="neutral" variant="subtle">
        {{ totalUnits }} units
      </UBadge>
    </div>

    <div
      v-if="props.items.length"
      class="mt-6 space-y-3"
    >
      <div
        v-for="item in props.items"
        :key="item.id"
        class="flex items-start justify-between gap-4 rounded-2xl border border-slate-200/70 p-4"
      >
        <div>
          <p class="font-medium text-slate-900">
            Product {{ item.product_id }}
          </p>
          <p class="mt-1 text-sm text-slate-600">
            {{ item.quantity }} x {{ formatCurrency(item.unit_price) }}
          </p>
        </div>

        <p class="font-semibold text-slate-900">
          {{ formatCurrency(item.line_total) }}
        </p>
      </div>
    </div>

    <div
      v-else
      class="mt-6 rounded-2xl border border-dashed border-slate-200 bg-slate-50/70 px-6 py-8"
    >
      <p class="text-sm font-medium text-slate-900">
        Shipment details unavailable
      </p>
      <p class="mt-2 text-sm text-slate-600">
        The current delivery contract does not define separate shipment items, so this view only shows linked order items when available.
      </p>
    </div>
  </UCard>
</template>
