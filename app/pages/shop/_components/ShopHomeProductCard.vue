<script setup lang="ts">
import type { Product } from "~/types/product";
import { formatNumber } from "~/utils/format";
import { progressWidthClass } from "~/utils/tailwind";

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
const minimumStock = computed(() =>
  Math.max(props.product.minimum_stock_quantity ?? 1, 1),
);

const stockRatio = computed(() => {
  if (stockQuantity.value <= 0) {
    return 0;
  }

  return Math.min(
    100,
    Math.max(
      12,
      Math.round((stockQuantity.value / (minimumStock.value * 3)) * 100),
    ),
  );
});
const stockRatioClass = computed(() => progressWidthClass(stockRatio.value));

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
    "Compare unit, stock, and core product details before adding this item to the cart.",
);

const shortSpecs = computed(() => {
  const specs =
    props.product.handbook?.specifications?.slice(0, 2).map((item) => ({
      label: item.label,
      value: item.value,
    })) ?? [];

  if (specs.length) {
    return specs;
  }

  return [
    {
      label: "Unit",
      value: props.product.unit || "unit",
    },
    {
      label: "Stock",
      value: formatNumber(stockQuantity.value),
    },
  ];
});

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
    class="group flex h-full flex-col overflow-hidden bg-white transition hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-[0_18px_34px_rgba(15,23,42,0.06)]"
    padding="none"
  >
    <NuxtLink
      :to="props.product.id ? `/shop/${props.product.id}` : '/shop/catalog'"
      class="relative aspect-[4/3] overflow-hidden bg-slate-100"
    >
      <NuxtImg
        :src="imageSrc"
        :alt="props.product.name || 'Construction product'"
        class="h-full w-full object-cover transition duration-500 group-hover:scale-[1.03]"
        loading="lazy"
      />
      <div class="absolute left-3 top-3">
        <span
          class="rounded-md border border-white/70 bg-white/90 px-2.5 py-1 text-[0.66rem] font-semibold uppercase tracking-[0.14em] text-slate-700 shadow-sm backdrop-blur"
        >
          {{ props.product.unit || "unit" }}
        </span>
      </div>
    </NuxtLink>

    <div class="flex flex-1 flex-col p-5">
      <div class="flex items-start justify-between gap-3">
        <div class="min-w-0">
          <p
            v-if="props.categoryName"
            class="truncate text-[0.68rem] font-semibold uppercase tracking-[0.16em] text-amber-700"
          >
            {{ props.categoryName }}
          </p>
          <NuxtLink
            :to="
              props.product.id ? `/shop/${props.product.id}` : '/shop/catalog'
            "
            class="mt-2 line-clamp-2 block text-lg font-semibold leading-snug text-slate-950 transition hover:text-[#004687]"
          >
            {{ props.product.name || "Unnamed product" }}
          </NuxtLink>
          <p
            v-if="props.product.sku"
            class="mt-1 truncate text-[0.7rem] font-semibold uppercase tracking-[0.14em] text-slate-500"
          >
            SKU: {{ props.product.sku }}
          </p>
        </div>
        <span
          class="shrink-0 rounded-md border px-2.5 py-1 text-[0.68rem] font-semibold"
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

      <p class="mt-4 line-clamp-2 text-sm leading-7 text-slate-600">
        {{ summary }}
      </p>

      <div class="mt-4 grid grid-cols-2 gap-2">
        <div
          v-for="spec in shortSpecs"
          :key="`${spec.label}-${spec.value}`"
          class="rounded-md border border-slate-200 bg-slate-50 px-3 py-2"
        >
          <p class="text-[0.62rem] font-semibold uppercase tracking-[0.14em] text-slate-500">
            {{ spec.label }}
          </p>
          <p class="mt-1 line-clamp-1 text-sm font-semibold text-slate-950">
            {{ spec.value }}
          </p>
        </div>
      </div>

      <div class="mt-auto pt-6">
        <div class="flex items-end justify-between gap-3">
          <StorefrontPriceDisplay
            :amount="props.product.price ?? 0"
            :unit="props.product.unit || 'unit'"
            size="sm"
          />
          <p
            v-if="props.quantityInCart"
            class="shrink-0 rounded-md bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600"
          >
            {{ props.quantityInCart }} in cart
          </p>
        </div>

        <div class="mt-3 h-1.5 rounded-full bg-slate-200">
          <div
            :class="['h-full rounded-full bg-amber-500', stockRatioClass]"
          />
        </div>
      </div>

      <div class="mt-5 grid gap-3 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center">
        <div class="flex flex-col gap-2">
          <NuxtLink
            :to="
              props.product.id ? `/shop/${props.product.id}` : '/shop/catalog'
            "
            class="text-xs font-semibold text-[#004687] transition hover:text-[#031b34]"
          >
            View details
          </NuxtLink>
        </div>

        <StorefrontButton
          tone="primary"
          class="w-full justify-center sm:w-auto"
          :disabled="props.disabled || stockQuantity <= 0"
          @click="emit('add', props.product.id)"
        >
          {{ props.quantityInCart ? "Add another" : "Add to cart" }}
        </StorefrontButton>
      </div>
    </div>
  </StorefrontSectionCard>
</template>
