<script setup lang="ts">
import type { Product } from "~/types/product";
import { formatNumber } from "~/utils/format";
import { getInventoryStockState } from "../shared/inventory-stock";

const props = defineProps<{
  product: Product;
  currentStock: number;
}>();

const minimumStock = computed(() => props.product.minimum_stock_quantity ?? 0);
const stockGap = computed(() => minimumStock.value - props.currentStock);

const status = computed(() =>
  getInventoryStockState(props.currentStock, minimumStock.value),
);
</script>

<template>
  <UCard>
    <div class="space-y-5">
      <div class="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p class="text-xs uppercase tracking-[0.18em] text-slate-500">
            Low Stock Monitoring
          </p>
          <h2 class="mt-2 text-xl font-semibold text-slate-900">
            Threshold status
          </h2>
          <p class="mt-2 text-sm text-slate-600">
            {{ status.description }}
          </p>
        </div>

        <UBadge :color="status.color" variant="subtle">
          {{ status.label }}
        </UBadge>
      </div>

      <div class="grid gap-3 sm:grid-cols-2">
        <div class="rounded-lg border border-slate-200/70 p-3">
          <p class="text-xs uppercase tracking-[0.18em] text-slate-500">
            Minimum threshold
          </p>
          <p class="mt-2 text-lg font-semibold text-slate-900">
            {{ formatNumber(minimumStock) }}
            {{ props.product.unit ?? "" }}
          </p>
        </div>

        <div class="rounded-lg border border-slate-200/70 p-3">
          <p class="text-xs uppercase tracking-[0.18em] text-slate-500">
            Risk gap
          </p>
          <p class="mt-2 text-lg font-semibold text-slate-900">
            {{
              stockGap > 0
                ? formatNumber(stockGap)
                : "0"
            }}
            {{ props.product.unit ?? "" }}
          </p>
        </div>
      </div>
    </div>
  </UCard>
</template>
