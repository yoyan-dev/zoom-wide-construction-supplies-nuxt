<script setup lang="ts">
import type { Product } from "~/types/product";
import { formatNumber, formatShortDateOrFallback } from "~/utils/format";
import { getInventoryStockState } from "../shared/inventory-stock";

const props = defineProps<{
  product: Product;
  currentStock: number;
  warehouseName: string;
  productBasePath?: string;
}>();

const stockBadge = computed(() =>
  getInventoryStockState(
    props.currentStock,
    props.product.minimum_stock_quantity ?? 0,
  ),
);
</script>

<template>
  <UCard>
    <div class="space-y-5">
      <div class="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p class="text-xs uppercase tracking-[0.18em] text-slate-500">
            Inventory Overview
          </p>
          <h2 class="mt-2 text-xl font-semibold text-slate-900">
            {{ props.product.name ?? "Unnamed product" }}
          </h2>
          <p class="mt-2 text-sm text-slate-600">
            SKU {{ props.product.sku ?? "Unavailable" }}
          </p>
        </div>

        <div class="flex flex-col items-start gap-2 md:items-end">
          <UBadge :color="stockBadge.color" variant="subtle">
            {{ stockBadge.label }}
          </UBadge>
          <UButton
            v-if="props.productBasePath && props.product.id"
            color="neutral"
            variant="ghost"
            size="sm"
            icon="i-lucide-package"
            :to="`${props.productBasePath}/${props.product.id}`"
          >
            View Product
          </UButton>
        </div>
      </div>

      <div class="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <div class="rounded-lg border border-slate-200/70 p-3">
          <p class="text-xs uppercase tracking-[0.18em] text-slate-500">
            Current stock
          </p>
          <p class="mt-2 text-lg font-semibold text-slate-900">
            {{ formatNumber(props.currentStock) }}
            {{ props.product.unit ?? "" }}
          </p>
        </div>

        <div class="rounded-lg border border-slate-200/70 p-3">
          <p class="text-xs uppercase tracking-[0.18em] text-slate-500">
            Minimum stock
          </p>
          <p class="mt-2 text-lg font-semibold text-slate-900">
            {{ formatNumber(props.product.minimum_stock_quantity ?? 0) }}
            {{ props.product.unit ?? "" }}
          </p>
        </div>

        <div class="rounded-lg border border-slate-200/70 p-3">
          <p class="text-xs uppercase tracking-[0.18em] text-slate-500">
            Warehouse
          </p>
          <p class="mt-2 text-sm font-semibold text-slate-900">
            {{ props.warehouseName }}
          </p>
        </div>

        <div class="rounded-lg border border-slate-200/70 p-3">
          <p class="text-xs uppercase tracking-[0.18em] text-slate-500">
            Updated
          </p>
          <p class="mt-2 text-sm font-semibold text-slate-900">
            {{ formatShortDateOrFallback(props.product.updated_at, "_") }}
          </p>
        </div>
      </div>
    </div>
  </UCard>
</template>
