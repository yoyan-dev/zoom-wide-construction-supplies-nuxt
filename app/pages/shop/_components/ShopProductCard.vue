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
  <UCard class="h-full border border-slate-200/70">
    <div class="flex h-full flex-col">
      <NuxtLink
        :to="detailTo"
        class="flex h-52 items-center justify-center overflow-hidden rounded-[24px] border border-slate-200/70 bg-gradient-to-br from-slate-100 via-white to-amber-50"
      >
        <NuxtImg
          v-if="props.product.image_url"
          :src="props.product.image_url"
          :alt="props.product.name ?? 'Product image'"
          class="h-full w-full object-cover"
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
      </NuxtLink>

      <div class="mt-5 flex flex-1 flex-col">
        <div class="flex flex-wrap items-center gap-2">
          <UBadge color="neutral" variant="subtle">
            {{ categoryName }}
          </UBadge>
          <UBadge :color="stockBadge.color" variant="subtle">
            {{ stockBadge.label }}
          </UBadge>
        </div>

        <NuxtLink
          :to="detailTo"
          class="mt-4 text-lg font-semibold text-slate-900 transition hover:text-amber-600"
        >
          {{ props.product.name ?? "Unnamed product" }}
        </NuxtLink>

        <p class="mt-2 line-clamp-3 text-sm leading-6 text-slate-600">
          {{ cardSummary }}
        </p>

        <div class="mt-5 grid gap-3 text-sm text-slate-600">
          <div class="flex items-center justify-between">
            <span>Unit price</span>
            <span class="font-semibold text-slate-900">
              {{ formatCurrency(props.product.price ?? 0) }}
            </span>
          </div>
          <div class="flex items-center justify-between">
            <span>Stock</span>
            <span class="font-medium text-slate-800">
              {{ formatNumber(stockQuantity) }} {{ props.product.unit ?? "unit" }}
            </span>
          </div>
          <div class="flex items-center justify-between">
            <span>Supplier</span>
            <span class="text-right font-medium text-slate-800">
              {{ props.product.supplier?.name ?? "Unassigned" }}
            </span>
          </div>
        </div>

        <div class="mt-6 flex items-center gap-3">
          <UButton
            class="flex-1 justify-center"
            color="neutral"
            variant="outline"
            :to="detailTo"
          >
            View Details
          </UButton>
          <UButton
            class="flex-1 justify-center"
            color="warning"
            :disabled="!props.product.id || !isPurchasable"
            @click="addToCart"
          >
            Add to Cart
          </UButton>
        </div>
      </div>
    </div>
  </UCard>
</template>
