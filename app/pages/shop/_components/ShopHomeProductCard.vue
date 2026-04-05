<script setup lang="ts">
import type { Product } from "~/types/product";
import { formatCurrency, formatNumber } from "~/utils/format";

const props = defineProps<{
  product: Product;
  categoryName?: string;
  quantityInCart?: number;
  disabled?: boolean;
}>();

const emit = defineEmits<{
  (e: "add", productId?: string): void;
}>();

const stockQuantity = computed(() => props.product.stock_quantity ?? 0);
const minimumStock = computed(() => Math.max(props.product.minimum_stock_quantity ?? 1, 1));

const stockRatio = computed(() => {
  if (stockQuantity.value <= 0) {
    return 0;
  }

  return Math.min(
    100,
    Math.max(12, Math.round((stockQuantity.value / (minimumStock.value * 3)) * 100)),
  );
});

const stockLabel = computed(() => {
  if (stockQuantity.value <= 0) {
    return "Out of stock";
  }

  if (stockQuantity.value <= minimumStock.value) {
    return "Low stock";
  }

  return "Ready for dispatch";
});

const summary = computed(
  () =>
    props.product.handbook?.summary ||
    props.product.description ||
    "Specification details can be added here as the catalog grows.",
);

const imageSrc = computed(
  () =>
    props.product.image_url ||
    `https://placehold.co/800x800/e2e8f0/0f172a?text=${encodeURIComponent(
      props.product.name || "Product",
    )}`,
);
</script>

<template>
  <StorefrontSectionCard
    class="flex h-full flex-col overflow-hidden border-slate-200/80 bg-white"
    padding="none"
  >
    <NuxtLink
      :to="props.product.id ? `/shop/${props.product.id}` : '/shop/catalog'"
      class="aspect-square overflow-hidden bg-slate-100"
    >
      <img
        :src="imageSrc"
        :alt="props.product.name || 'Construction product'"
        class="h-full w-full object-cover transition duration-500 hover:scale-[1.03]"
        loading="lazy"
      />
    </NuxtLink>

    <div class="flex flex-1 flex-col p-6">
      <div class="flex items-start justify-between gap-4">
        <div>
          <p
            v-if="props.categoryName"
            class="text-[0.68rem] font-semibold uppercase tracking-[0.2em] text-amber-700"
          >
            {{ props.categoryName }}
          </p>
          <NuxtLink
            :to="props.product.id ? `/shop/${props.product.id}` : '/shop/catalog'"
            class="mt-2 block text-xl font-bold tracking-tight text-slate-950 transition hover:text-[#004687]"
          >
            {{ props.product.name || "Unnamed product" }}
          </NuxtLink>
          <p
            v-if="props.product.sku"
            class="mt-1 text-[0.7rem] font-semibold uppercase tracking-[0.18em] text-slate-500"
          >
            SKU: {{ props.product.sku }}
          </p>
        </div>
        <span
          class="rounded-md border px-2.5 py-1 text-[0.68rem] font-semibold uppercase tracking-[0.16em]"
          :class="
            stockQuantity > minimumStock
              ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
              : stockQuantity > 0
                ? 'border-amber-200 bg-amber-50 text-amber-700'
                : 'border-rose-200 bg-rose-50 text-rose-700'
          "
        >
          {{ stockLabel }}
        </span>
      </div>

      <p class="mt-4 line-clamp-3 text-sm leading-7 text-slate-600">
        {{ summary }}
      </p>

      <div class="mt-6">
        <div class="flex items-end justify-between gap-3">
          <div>
            <p class="text-2xl font-bold tracking-tight text-slate-950">
              {{ formatCurrency(props.product.price ?? 0) }}
            </p>
            <p class="text-xs uppercase tracking-[0.16em] text-slate-500">
              per {{ props.product.unit || "unit" }}
            </p>
          </div>
          <p class="text-sm font-medium text-slate-600">
            {{ formatNumber(stockQuantity) }} in stock
          </p>
        </div>

        <div class="mt-3 h-1.5 rounded-full bg-slate-200">
          <div
            class="h-full rounded-full bg-amber-500"
            :style="{ width: `${stockRatio}%` }"
          />
        </div>
      </div>

      <div class="mt-6 flex items-center justify-between gap-3">
        <div class="flex flex-col gap-2">
          <p
            v-if="props.quantityInCart"
            class="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500"
          >
            {{ props.quantityInCart }} already in cart
          </p>
          <span v-else class="text-xs text-slate-400">
            Ready for shortlist
          </span>
          <NuxtLink
            :to="props.product.id ? `/shop/${props.product.id}` : '/shop/catalog'"
            class="text-xs font-semibold uppercase tracking-[0.16em] text-[#004687] transition hover:text-[#031b34]"
          >
            View details
          </NuxtLink>
        </div>

        <StorefrontButton
          tone="primary"
          :disabled="props.disabled || stockQuantity <= 0"
          @click="emit('add', props.product.id)"
        >
          {{ props.quantityInCart ? "Add another" : "Add to cart" }}
        </StorefrontButton>
      </div>
    </div>
  </StorefrontSectionCard>
</template>
