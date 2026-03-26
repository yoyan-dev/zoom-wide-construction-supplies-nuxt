<script setup lang="ts">
import type { OrderItem } from "~/types/order";
import { formatCurrency } from "~/utils/format";

const props = defineProps<{
  items: OrderItem[];
  totalAmount: number;
}>();

const totalUnits = computed(() =>
  props.items.reduce((sum, item) => sum + item.quantity, 0),
);

const itemsTotal = computed(() =>
  props.items.reduce((sum, item) => sum + item.line_total, 0),
);
</script>

<template>
  <UCard>
    <div class="flex items-center justify-between gap-4">
      <div>
        <p class="text-xs uppercase tracking-[0.18em] text-slate-500">
          Order Items
        </p>
        <h2 class="mt-2 text-xl font-semibold text-slate-900">
          Item Breakdown
        </h2>
      </div>

      <UBadge color="primary" variant="subtle">
        {{ props.items.length }} lines
      </UBadge>
    </div>

    <div v-if="props.items.length" class="mt-6 space-y-3">
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
        <div class="text-right">
          <p class="font-semibold text-slate-900">
            {{ formatCurrency(item.line_total) }}
          </p>
          <p class="mt-1 text-xs text-slate-500">
            Item {{ item.id }}
          </p>
        </div>
      </div>
    </div>

    <div
      v-else
      class="mt-6 rounded-2xl border border-dashed border-slate-200 bg-slate-50/70 px-6 py-10 text-center"
    >
      <p class="text-sm font-medium text-slate-900">
        Order items unavailable
      </p>
      <p class="mt-2 text-sm text-slate-600">
        The current order response does not include line-item details yet.
      </p>
    </div>

    <div class="mt-6 grid gap-4 md:grid-cols-3">
      <div>
        <p class="text-xs uppercase tracking-[0.18em] text-slate-500">
          Line Items
        </p>
        <p class="mt-2 text-lg font-semibold text-slate-800">
          {{ props.items.length }}
        </p>
      </div>
      <div>
        <p class="text-xs uppercase tracking-[0.18em] text-slate-500">
          Total Units
        </p>
        <p class="mt-2 text-lg font-semibold text-slate-800">
          {{ totalUnits }}
        </p>
      </div>
      <div>
        <p class="text-xs uppercase tracking-[0.18em] text-slate-500">
          Total Amount
        </p>
        <p class="mt-2 text-lg font-semibold text-slate-800">
          {{ formatCurrency(props.items.length ? itemsTotal : props.totalAmount) }}
        </p>
      </div>
    </div>
  </UCard>
</template>
