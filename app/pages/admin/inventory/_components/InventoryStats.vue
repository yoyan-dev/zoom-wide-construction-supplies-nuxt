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
  const outOfStock = props.products.filter(
    (product) => (stockMap.value[product.id ?? ""] ?? 0) === 0,
  ).length;
  const lowStock = props.products.filter((product) => {
    const currentStock = stockMap.value[product.id ?? ""] ?? 0;
    return (
      currentStock > 0 &&
      currentStock <= (product.minimum_stock_quantity ?? 0)
    );
  }).length;
  const healthy = props.products.filter((product) => {
    const currentStock = stockMap.value[product.id ?? ""] ?? 0;
    return currentStock > (product.minimum_stock_quantity ?? 0);
  }).length;

  return { total, outOfStock, lowStock, healthy };
});
</script>

<template>
  <section class="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
    <UCard>
      <p class="text-xs uppercase tracking-[0.18em] text-slate-500">
        Inventory Items
      </p>
      <p class="mt-2 text-2xl font-semibold">
        {{ formatNumber(totals.total) }}
      </p>
      <p class="mt-1 text-sm text-slate-500">
        Products with stock visibility
      </p>
    </UCard>

    <UCard class="border border-amber-200/70 bg-amber-50/40">
      <p class="text-xs uppercase tracking-[0.18em] text-amber-700">
        Low Stock
      </p>
      <p class="mt-2 text-2xl font-semibold">
        {{ formatNumber(totals.lowStock) }}
      </p>
      <p class="mt-1 text-sm text-slate-500">
        At or below the current threshold
      </p>
    </UCard>

    <UCard class="border border-rose-200/70 bg-rose-50/40">
      <p class="text-xs uppercase tracking-[0.18em] text-rose-700">
        Out Of Stock
      </p>
      <p class="mt-2 text-2xl font-semibold">
        {{ formatNumber(totals.outOfStock) }}
      </p>
      <p class="mt-1 text-sm text-slate-500">
        Requires immediate stock attention
      </p>
    </UCard>

    <UCard class="border border-emerald-200/70 bg-emerald-50/40">
      <p class="text-xs uppercase tracking-[0.18em] text-emerald-700">
        Healthy Stock
      </p>
      <p class="mt-2 text-2xl font-semibold">
        {{ formatNumber(totals.healthy) }}
      </p>
      <p class="mt-1 text-sm text-slate-500">
        Above the minimum threshold
      </p>
    </UCard>
  </section>
</template>
