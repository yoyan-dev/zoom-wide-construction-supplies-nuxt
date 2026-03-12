<script setup lang="ts">
import type { Product } from "~/types/product";
import { formatNumber } from "~/utils/format";

const props = defineProps<{
  products: Product[];
}>();

const totals = computed(() => {
  const total = props.products.length;
  const active = props.products.filter((product) => product.is_active).length;
  const lowStock = props.products.filter(
    (product) => product.stock_quantity <= product.minimum_stock_quantity,
  ).length;
  return { total, active, lowStock };
});
</script>

<template>
  <section class="grid gap-4 md:grid-cols-3">
    <UCard>
      <p class="text-xs uppercase tracking-[0.18em] text-slate-500">SKUs</p>
      <p class="mt-2 text-2xl font-semibold">
        {{ formatNumber(totals.total) }}
      </p>
      <p class="mt-1 text-sm text-slate-500">Total catalog items</p>
    </UCard>
    <UCard>
      <p class="text-xs uppercase tracking-[0.18em] text-slate-500">Active</p>
      <p class="mt-2 text-2xl font-semibold">
        {{ formatNumber(totals.active) }}
      </p>
      <p class="mt-1 text-sm text-slate-500">Live for ordering</p>
    </UCard>
    <UCard class="border border-amber-200/70 bg-amber-50/40">
      <p class="text-xs uppercase tracking-[0.18em] text-amber-700">
        Low Stock
      </p>
      <p class="mt-2 text-2xl font-semibold">
        {{ formatNumber(totals.lowStock) }}
      </p>
      <p class="mt-1 text-sm text-slate-500">Needs replenishment</p>
    </UCard>
  </section>
</template>
