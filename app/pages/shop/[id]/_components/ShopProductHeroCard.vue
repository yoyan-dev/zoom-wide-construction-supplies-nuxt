<script setup lang="ts">
import type { Product } from "~/types/product";
import { formatCurrency, formatNumber } from "~/utils/format";

const props = defineProps<{
  product: Product;
  categoryName?: string;
  quantity: number;
  quantityInCart?: number;
  isCartBusy?: boolean;
}>();

const emit = defineEmits<{
  (e: "increase"): void;
  (e: "decrease"): void;
  (e: "addToCart"): void;
}>();

const imageSrc = computed(
  () =>
    props.product.image_url ||
    `https://placehold.co/1200x1000/e2e8f0/0f172a?text=${encodeURIComponent(
      props.product.name || "Product",
    )}`,
);

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
    Math.max(10, Math.round((stockQuantity.value / (minimumStock.value * 3)) * 100)),
  );
});

const stockLabel = computed(() => {
  if (stockQuantity.value <= 0) {
    return "Out of stock";
  }

  if (stockQuantity.value <= minimumStock.value) {
    return `Limited stock: ${formatNumber(stockQuantity.value)} left`;
  }

  return `${formatNumber(stockQuantity.value)} units available`;
});

const summaryTiles = computed(() => {
  const specificationMap = Object.fromEntries(
    (props.product.handbook?.specifications ?? []).map((item) => [
      item.label.toLowerCase(),
      item.value,
    ]),
  );

  return [
    {
      label: "Unit",
      value: props.product.unit || "unit",
    },
    {
      label: "SKU",
      value: props.product.sku || "Pending",
    },
    {
      label: "Stock",
      value: formatNumber(stockQuantity.value),
    },
    {
      label: "Category",
      value: props.categoryName || "General",
    },
    {
      label: "Primary spec",
      value:
        specificationMap.power ||
        specificationMap["power output"] ||
        specificationMap.grade ||
        "Reference-ready",
    },
    {
      label: "Applications",
      value: String(props.product.handbook?.applications?.length ?? 0),
    },
  ];
});
</script>

<template>
  <div class="grid gap-8 lg:grid-cols-12 lg:items-start">
    <div class="lg:col-span-7">
      <div class="grid grid-cols-6 gap-4">
        <StorefrontSectionCard
          class="col-span-6 overflow-hidden"
          padding="none"
        >
          <img
            :src="imageSrc"
            :alt="props.product.name || 'Construction product detail image'"
            class="h-[360px] w-full object-cover md:h-[500px]"
          />
        </StorefrontSectionCard>

        <StorefrontSectionCard
          class="col-span-2 overflow-hidden border-slate-900"
          padding="none"
        >
          <img
            :src="imageSrc"
            :alt="`${props.product.name || 'Product'} alternate view`"
            class="aspect-square h-full w-full object-cover"
          />
        </StorefrontSectionCard>

        <StorefrontSectionCard
          class="col-span-2 flex aspect-square items-end bg-slate-950 text-white"
          padding="lg"
        >
          <div>
            <p class="text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-amber-300">
              Handbook
            </p>
            <p class="mt-2 text-lg font-bold tracking-tight">
              {{ props.product.handbook?.features?.[0] || "Built for field use" }}
            </p>
          </div>
        </StorefrontSectionCard>

        <StorefrontSectionCard
          class="col-span-2 flex aspect-square items-end bg-slate-100"
          padding="lg"
        >
          <div>
            <p class="text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-slate-500">
              Stock signal
            </p>
            <p class="mt-2 text-lg font-bold tracking-tight text-slate-950">
              {{ stockLabel }}
            </p>
          </div>
        </StorefrontSectionCard>
      </div>
    </div>

    <div class="lg:col-span-5 space-y-6">
      <div>
        <span
          class="inline-flex rounded-md bg-slate-900 px-3 py-1 text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-amber-300"
        >
          {{ props.categoryName || "Catalog item" }}
        </span>
        <h1 class="mt-4 text-4xl font-black tracking-[-0.06em] text-slate-950 md:text-5xl">
          {{ props.product.name || "Unnamed product" }}
        </h1>
        <div
          class="mt-4 flex flex-wrap items-center gap-3 text-[0.72rem] font-semibold uppercase tracking-[0.18em] text-slate-500"
        >
          <span v-if="props.product.sku">SKU {{ props.product.sku }}</span>
          <span>/</span>
          <span>{{ formatNumber(stockQuantity) }} in stock</span>
          <span v-if="props.quantityInCart">/</span>
          <span v-if="props.quantityInCart">{{ props.quantityInCart }} already in cart</span>
        </div>
      </div>

      <StorefrontSectionCard class="bg-slate-50" padding="lg">
        <div class="flex items-start justify-between gap-4">
          <div>
            <p class="text-4xl font-bold tracking-[-0.05em] text-slate-950">
              {{ formatCurrency(props.product.price ?? 0) }}
            </p>
            <p class="mt-1 text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
              per {{ props.product.unit || "unit" }}
            </p>
          </div>

          <div class="min-w-[148px] text-right">
            <div class="h-2 rounded-full bg-slate-200">
              <div
                class="h-full rounded-full bg-amber-500"
                :style="{ width: `${stockRatio}%` }"
              />
            </div>
            <p class="mt-2 text-[0.68rem] font-semibold uppercase tracking-[0.16em] text-amber-700">
              {{ stockLabel }}
            </p>
          </div>
        </div>

        <div class="mt-6 flex items-center gap-3">
          <div class="flex items-center rounded-xl border border-slate-200 bg-white">
            <button
              type="button"
              class="px-4 py-3 text-lg font-bold text-slate-700 transition hover:text-slate-950"
              :disabled="props.quantity <= 1 || props.isCartBusy"
              @click="emit('decrease')"
            >
              -
            </button>
            <span class="min-w-12 text-center text-sm font-semibold text-slate-950">
              {{ props.quantity }}
            </span>
            <button
              type="button"
              class="px-4 py-3 text-lg font-bold text-slate-700 transition hover:text-slate-950"
              :disabled="stockQuantity <= 0 || props.isCartBusy"
              @click="emit('increase')"
            >
              +
            </button>
          </div>

          <StorefrontButton
            tone="primary"
            size="xl"
            class="flex-1"
            :disabled="stockQuantity <= 0 || props.isCartBusy"
            :loading="props.isCartBusy"
            @click="emit('addToCart')"
          >
            Add to cart
          </StorefrontButton>
        </div>

        <StorefrontButton
          tone="secondary"
          size="lg"
          class="mt-3 w-full"
          to="#technical-specs"
        >
          View technical specs
        </StorefrontButton>
      </StorefrontSectionCard>

      <div class="grid grid-cols-2 gap-4">
        <StorefrontSectionCard
          v-for="tile in summaryTiles"
          :key="tile.label"
          padding="md"
          class="bg-white"
        >
          <p class="text-[0.64rem] font-semibold uppercase tracking-[0.18em] text-slate-500">
            {{ tile.label }}
          </p>
          <p class="mt-2 text-lg font-bold tracking-tight text-slate-950">
            {{ tile.value }}
          </p>
        </StorefrontSectionCard>
      </div>
    </div>
  </div>
</template>
