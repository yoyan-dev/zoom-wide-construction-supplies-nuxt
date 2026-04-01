<script setup lang="ts">
import type { Category } from "~/types/category";
import type { Product } from "~/types/product";
import ShopProductCard from "../../_components/ShopProductCard.vue";

const props = defineProps<{
  products: Product[];
  isLoading: boolean;
}>();

const relatedCategories = computed<Category[]>(() => {
  const categoryMap = new Map<string, Category>();

  props.products.forEach((product) => {
    if (product.category?.id && !categoryMap.has(product.category.id)) {
      categoryMap.set(product.category.id, product.category);
    }
  });

  return Array.from(categoryMap.values());
});
</script>

<template>
  <section class="space-y-4">
    <div class="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <p class="text-xs font-medium uppercase tracking-[0.2em] text-amber-700">Related Products</p>
        <h2 class="mt-2 text-2xl font-semibold tracking-tight text-slate-900">
          Similar materials you may also need
        </h2>
      </div>
      <UButton to="/shop" color="neutral" variant="outline" class="rounded-lg font-semibold">
        Back to catalog
      </UButton>
    </div>

    <div v-if="props.isLoading" class="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
      <USkeleton v-for="idx in 3" :key="idx" class="h-[360px] rounded-lg" />
    </div>

    <div v-else-if="props.products.length" class="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
      <ShopProductCard
        v-for="product in props.products"
        :key="product.id ?? product.name"
        :product="product"
        :categories="relatedCategories"
      />
    </div>

    <div
      v-else
      class="rounded-xl bg-white/95 shadow-sm p-5 text-sm leading-6 text-slate-600"
    >
      No related products available in this category right now.
    </div>
  </section>
</template>
