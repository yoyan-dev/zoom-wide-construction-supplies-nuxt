<script setup lang="ts">
import type { InventoryLog } from "~/types/inventory";
import type { Product } from "~/types/product";
import { buildInventoryBalanceMap } from "~/utils/inventory-balance";
import { formatNumber } from "~/utils/format";

const props = defineProps<{
  products: Product[];
  inventoryLogs: InventoryLog[];
}>();

const stockMap = computed(() =>
  buildInventoryBalanceMap(props.inventoryLogs, props.products),
);

const totals = computed(() => {
  const total = props.products.length;
  const active = props.products.filter((product) => product.is_active).length;
  const lowStock = props.products.filter(
    (product) =>
      (stockMap.value[product.id ?? ""] ?? 0) <=
      (product.minimum_stock_quantity ?? 0),
  ).length;
  const handbookReady = props.products.filter(
    (product) =>
      product.handbook?.summary ||
      product.handbook?.features?.length ||
      product.handbook?.applications?.length ||
      product.handbook?.specifications?.length,
  ).length;
  return { total, active, lowStock, handbookReady };
});
</script>

<template>
  <section class="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
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
    <UCard class="border border-sky-200/70 bg-sky-50/40">
      <p class="text-xs uppercase tracking-[0.18em] text-sky-700">
        Handbook Ready
      </p>
      <p class="mt-2 text-2xl font-semibold">
        {{ formatNumber(totals.handbookReady) }}
      </p>
      <p class="mt-1 text-sm text-slate-500">With guide/spec content</p>
    </UCard>
  </section>
</template>
