<script setup lang="ts">
import type { Category } from "~/types/category";
import type { Product } from "~/types/product";
import ShopProductCard from "./ShopProductCard.vue";
import ShopStateCard from "./ShopStateCard.vue";

const props = defineProps<{
  products: Product[];
  categories: Category[];
  search: string;
  activeCategoryLabel: string;
  supplierFilter: string;
  maxPriceFilter: number | null;
  isLoading: boolean;
}>();

const visibleProducts = computed(() =>
  props.products.filter((product) => {
    if (product.is_active === false) {
      return false;
    }

    const productSupplier = product.supplier?.name?.trim() ?? "";
    const productPrice = Number(product.price ?? 0);

    if (
      props.supplierFilter !== "all" &&
      productSupplier !== props.supplierFilter
    ) {
      return false;
    }

    if (
      props.maxPriceFilter !== null &&
      Number.isFinite(productPrice) &&
      productPrice > props.maxPriceFilter
    ) {
      return false;
    }

    return true;
  }),
);

const emptyTitle = computed(() =>
  props.search ? "No products match your search" : "No products available",
);

const emptyDescription = computed(() =>
  props.search || hasSupplierFilter.value || hasPriceFilter.value
    ? "Try a broader search term or relax your supplier and price filters."
    : "Products will appear here once the storefront catalog is available.",
);

const hasSearch = computed(() => Boolean(props.search.trim()));
const hasSupplierFilter = computed(() => props.supplierFilter !== "all");
const hasPriceFilter = computed(() => props.maxPriceFilter !== null);

const sortOptions = [
  { label: "Most popular", value: "popular" },
  { label: "Newest", value: "newest" },
  { label: "Price: low to high", value: "price_asc" },
  { label: "Price: high to low", value: "price_desc" },
] as const;

const sortBy = ref<(typeof sortOptions)[number]["value"]>("popular");
const sortValues = new Set(sortOptions.map((option) => option.value));

const handleSortChange = (value: string) => {
  if (sortValues.has(value as (typeof sortOptions)[number]["value"])) {
    sortBy.value = value as (typeof sortOptions)[number]["value"];
  }
};

const sortedProducts = computed(() => {
  const products = [...visibleProducts.value];

  if (sortBy.value === "price_asc") {
    return products.sort(
      (left, right) => Number(left.price ?? 0) - Number(right.price ?? 0),
    );
  }

  if (sortBy.value === "price_desc") {
    return products.sort(
      (left, right) => Number(right.price ?? 0) - Number(left.price ?? 0),
    );
  }

  if (sortBy.value === "newest") {
    return products.sort(
      (left, right) =>
        new Date(right.created_at ?? 0).getTime() -
        new Date(left.created_at ?? 0).getTime(),
    );
  }

  // "Popular" prioritizes stocked items and richer product content.
  return products.sort((left, right) => {
    const rightScore =
      Number(right.stock_quantity ?? 0) +
      (right.handbook?.features?.length ?? 0) * 3;
    const leftScore =
      Number(left.stock_quantity ?? 0) + (left.handbook?.features?.length ?? 0) * 3;
    return rightScore - leftScore;
  });
});
</script>

<template>
  <div class="space-y-5">
    <section class="rounded-xl bg-white/95 shadow-sm p-5 md:p-6">
      <div class="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <p class="text-xs font-medium uppercase tracking-[0.2em] text-amber-700">
            Catalog Results
          </p>
          <h2 class="mt-2 text-2xl font-semibold tracking-tight text-slate-900">
            {{ visibleProducts.length }} stocked items
          </h2>
          <p class="mt-2 text-sm text-slate-600">
            Showing products in <span class="font-semibold text-slate-800">{{ props.activeCategoryLabel }}</span>
          </p>
        </div>
        <div class="flex flex-wrap items-center gap-2">
          <USelect
            :items="sortOptions"
            :model-value="sortBy"
            size="sm"
            class="w-44"
            @update:model-value="handleSortChange(String($event))"
          />
          <UBadge color="neutral" variant="subtle">
            Grid view
          </UBadge>
          <UBadge v-if="hasSearch" color="info" variant="subtle">
            Query: {{ props.search }}
          </UBadge>
          <UBadge v-if="hasSupplierFilter" color="warning" variant="subtle">
            Supplier: {{ props.supplierFilter }}
          </UBadge>
          <UBadge v-if="hasPriceFilter" color="neutral" variant="subtle">
            Max: {{ props.maxPriceFilter }}
          </UBadge>
          <UButton color="neutral" variant="outline" to="/shop/categories">
            View categories
          </UButton>
          <UButton color="warning" variant="soft" class="rounded-lg font-semibold shadow-sm" to="/cart">
            Review cart
          </UButton>
        </div>
      </div>
    </section>

    <section
      v-if="props.isLoading"
      class="grid gap-5 sm:grid-cols-2 xl:grid-cols-3"
    >
      <USkeleton
        v-for="index in 6"
        :key="index"
        class="h-[380px] rounded-lg"
      />
    </section>

    <section
      v-else-if="visibleProducts.length"
      class="grid gap-5 sm:grid-cols-2 xl:grid-cols-3"
    >
      <ShopProductCard
        v-for="product in sortedProducts"
        :key="product.id ?? product.name"
        :product="product"
        :categories="props.categories"
      />
    </section>

    <ShopStateCard
      v-else
      eyebrow="Storefront"
      :title="emptyTitle"
      :description="emptyDescription"
      tone="neutral"
    />

    <section
      v-if="visibleProducts.length"
      class="rounded-xl bg-white/95 shadow-sm p-5 md:p-6"
    >
      <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <p class="text-xs uppercase tracking-[0.22em] text-amber-600">
          Next Step
        </p>
        <div class="flex flex-wrap gap-2">
          <UButton color="warning" class="rounded-lg font-semibold shadow-sm" to="/cart">Go to cart</UButton>
          <UButton color="neutral" variant="outline" class="rounded-lg font-semibold" to="/checkout">Proceed to checkout</UButton>
        </div>
      </div>
      <p class="text-sm leading-6 text-slate-600">
        Continue shopping or move straight to checkout once your shortlist is ready.
      </p>
    </section>
  </div>
</template>
