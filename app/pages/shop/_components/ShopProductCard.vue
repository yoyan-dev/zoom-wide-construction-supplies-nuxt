<script setup lang="ts">
import type { Category } from "~/types/category";
import type { Product } from "~/types/product";
import { formatCurrency, formatNumber } from "~/utils/format";

const props = defineProps<{
  product: Product;
  categories: Category[];
}>();

const cartStore = useCartStore();

type BadgeColor =
  | "primary"
  | "secondary"
  | "success"
  | "info"
  | "warning"
  | "error"
  | "neutral";

const stockQuantity = computed(() => props.product.stock_quantity ?? 0);
const isAvailable = computed(() => props.product.is_active !== false);
const isPurchasable = computed(() => isAvailable.value && stockQuantity.value > 0);
const detailTo = computed(() =>
  props.product.id ? `/shop/${props.product.id}` : "/shop",
);
const unitLabel = computed(() => props.product.unit ?? "unit");
const supplierName = computed(() => props.product.supplier?.name ?? "ZOOM Wide");
const displayPrice = computed(() => formatCurrency(props.product.price ?? 0));
const isNewArrival = computed(() => {
  if (!props.product.created_at) {
    return false;
  }

  return Date.now() - new Date(props.product.created_at).getTime() < 1000 * 60 * 60 * 24 * 30;
});

const isPopular = computed(
  () =>
    isAvailable.value &&
    Number(stockQuantity.value) > 0 &&
    (props.product.handbook?.features?.length ?? 0) >= 2,
);

const cardSummary = computed(
  () =>
    props.product.handbook?.summary?.trim() ||
    props.product.description?.trim() ||
    "Product details will be available on the item page.",
);

const categoryName = computed(() => {
  if (props.product.category?.name) {
    return props.product.category.name;
  }

  if (!props.product.category_id) {
    return "Catalog item";
  }

  return (
    props.categories.find((category) => category.id === props.product.category_id)
      ?.name ?? "Catalog item"
  );
});

const stockBadge = computed<{ color: BadgeColor; label: string }>(() => {
  if (!isAvailable.value) {
    return { color: "neutral", label: "Unavailable" };
  }

  if (stockQuantity.value <= 0) {
    return { color: "error", label: "Out of stock" };
  }

  if (
    props.product.minimum_stock_quantity !== undefined &&
    stockQuantity.value <= props.product.minimum_stock_quantity
  ) {
    return { color: "warning", label: "Low stock" };
  }

  return { color: "success", label: "In stock" };
});

const addToCart = () => {
  cartStore.addToCart(props.product, 1);
};
</script>

<template>
  <UCard
    class="group h-full rounded-xl bg-white/95 shadow-sm transition duration-200 hover:-translate-y-1 hover:shadow-md"
  >
    <div class="flex h-full flex-col">
      <NuxtLink
        :to="detailTo"
        class="relative flex h-52 items-center justify-center overflow-hidden rounded-lg bg-[radial-gradient(circle_at_top_left,_rgba(245,158,11,0.18),_transparent_42%),linear-gradient(180deg,#f8fafc_0%,#ffffff_100%)]"
      >
        <NuxtImg
          v-if="props.product.image_url"
          :src="props.product.image_url"
          :alt="props.product.name ?? 'Product image'"
          class="h-full w-full object-cover transition duration-300 group-hover:scale-105"
          width="640"
          height="480"
        />
        <div v-else class="text-center">
          <p class="text-xs uppercase tracking-[0.18em] text-slate-500">
            Product
          </p>
          <p class="mt-3 text-4xl font-semibold text-slate-800">
            {{ props.product.name?.slice(0, 1)?.toUpperCase() ?? "P" }}
          </p>
        </div>

        <div class="absolute inset-x-3 top-3 flex items-center justify-between gap-2">
          <div class="flex flex-wrap gap-2">
            <UBadge color="neutral" variant="solid" class="max-w-[70%] truncate">
              {{ categoryName }}
            </UBadge>
            <UBadge v-if="isNewArrival" color="info" variant="soft">
              New
            </UBadge>
            <UBadge v-if="isPopular" color="warning" variant="soft">
              Popular
            </UBadge>
          </div>
          <div class="rounded-full bg-white/95 px-3 py-1 text-sm font-semibold text-slate-900 shadow-sm">
            {{ displayPrice }}
          </div>
        </div>
      </NuxtLink>

      <div class="mt-4 flex flex-1 flex-col">
        <div class="flex flex-wrap items-center gap-2">
          <UBadge :color="stockBadge.color" variant="subtle">
            {{ stockBadge.label }}
          </UBadge>
          <UBadge color="neutral" variant="subtle">
            {{ unitLabel }}
          </UBadge>
        </div>

        <NuxtLink
          :to="detailTo"
          class="mt-3 line-clamp-2 text-lg font-semibold text-slate-900 transition hover:text-amber-700 md:text-xl"
        >
          {{ props.product.name ?? "Unnamed product" }}
        </NuxtLink>

        <p class="mt-2 line-clamp-2 text-sm leading-6 text-slate-600">
          {{ cardSummary }}
        </p>

        <div
          class="rounded-lg bg-slate-50/80 mt-4 grid gap-2 p-3 text-sm text-slate-600"
        >
          <div class="flex items-center justify-between">
            <span>Stock</span>
            <span class="font-medium text-slate-800">
              {{ formatNumber(stockQuantity) }} {{ unitLabel }}
            </span>
          </div>
          <div class="flex items-center justify-between">
            <span>Supplier</span>
            <span class="text-right font-medium text-slate-800">
              {{ supplierName }}
            </span>
          </div>
        </div>

        <div class="mt-5 flex items-end justify-between gap-4">
          <div>
            <p class="text-xs uppercase tracking-[0.16em] text-slate-500">
              Unit price
            </p>
            <p class="mt-1 text-2xl font-semibold tracking-tight text-slate-900">
              {{ displayPrice }}
            </p>
          </div>
          <p class="text-sm text-slate-600">
            {{ formatNumber(stockQuantity) }} {{ unitLabel }} available
          </p>
        </div>

        <div class="mt-4 flex items-center gap-3">
          <UButton
            class="rounded-lg font-semibold flex-1 justify-center"
            color="neutral"
            variant="outline"
            :to="detailTo"
          >
            View Details
          </UButton>
          <UButton
            class="rounded-lg font-semibold shadow-sm flex-1 justify-center"
            color="warning"
            :disabled="!props.product.id || !isPurchasable"
            @click="addToCart"
          >
            {{ isPurchasable ? "Add to Cart" : "Unavailable" }}
          </UButton>
        </div>
      </div>
    </div>
  </UCard>
</template>
