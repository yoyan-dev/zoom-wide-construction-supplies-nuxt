<script setup lang="ts">
import type { Category } from "~/types/category";
import type { Product } from "~/types/product";
import ShopProductCard from "./ShopProductCard.vue";
import ShopStateCard from "./ShopStateCard.vue";

const props = defineProps<{
  products: Product[];
  categories: Category[];
  search: string;
  isLoading: boolean;
}>();

const visibleProducts = computed(() =>
  props.products.filter((product) => product.is_active !== false),
);

const emptyTitle = computed(() =>
  props.search ? "No products match your search" : "No products available",
);

const emptyDescription = computed(() =>
  props.search
    ? "Try a broader search term or choose a different category."
    : "Products will appear here once the storefront catalog is available.",
);
</script>

<template>
  <div class="space-y-6">
    <div
      v-if="props.isLoading"
      class="grid gap-6 md:grid-cols-2 xl:grid-cols-3"
    >
      <USkeleton
        v-for="index in 6"
        :key="index"
        class="h-[420px] rounded-[28px]"
      />
    </div>

    <div
      v-else-if="visibleProducts.length"
      class="grid gap-6 md:grid-cols-2 xl:grid-cols-3"
    >
      <ShopProductCard
        v-for="product in visibleProducts"
        :key="product.id ?? product.name"
        :product="product"
        :categories="props.categories"
      />
    </div>

    <ShopStateCard
      v-else
      eyebrow="Storefront"
      :title="emptyTitle"
      :description="emptyDescription"
      tone="neutral"
    />
  </div>
</template>
