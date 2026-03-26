<script setup lang="ts">
import type { Product } from "~/types/product";
import { formatCurrency, formatNumber } from "~/utils/format";

const props = defineProps<{
  product: Product;
}>();

const productInitial = computed(
  () => props.product.name?.slice(0, 1).toUpperCase() ?? "P",
);
</script>

<template>
  <UCard>
    <div
      class="flex h-72 items-center justify-center overflow-hidden rounded-[28px] border border-slate-200/70 bg-gradient-to-br from-slate-100 via-white to-amber-50"
    >
      <NuxtImg
        v-if="props.product.image_url"
        :src="props.product.image_url"
        :alt="props.product.name ?? 'Product image'"
        class="h-full w-full object-cover"
        width="960"
        height="720"
      />
      <div v-else class="text-center">
        <p class="text-xs uppercase tracking-[0.18em] text-slate-500">
          Product
        </p>
        <p class="mt-3 text-5xl font-semibold text-slate-800">
          {{ productInitial }}
        </p>
      </div>
    </div>

    <div class="mt-6 grid gap-4 md:grid-cols-3">
      <div>
        <p class="text-xs uppercase tracking-[0.18em] text-slate-500">
          Unit Price
        </p>
        <p class="mt-2 text-lg font-semibold text-slate-800">
          {{ formatCurrency(props.product.price ?? 0) }}
        </p>
      </div>
      <div>
        <p class="text-xs uppercase tracking-[0.18em] text-slate-500">
          Stock On Hand
        </p>
        <p class="mt-2 text-lg font-semibold text-slate-800">
          {{ formatNumber(props.product.stock_quantity ?? 0) }}
        </p>
      </div>
      <div>
        <p class="text-xs uppercase tracking-[0.18em] text-slate-500">
          Minimum Stock
        </p>
        <p class="mt-2 text-lg font-semibold text-slate-800">
          {{ formatNumber(props.product.minimum_stock_quantity ?? 0) }}
        </p>
      </div>
    </div>
  </UCard>
</template>
