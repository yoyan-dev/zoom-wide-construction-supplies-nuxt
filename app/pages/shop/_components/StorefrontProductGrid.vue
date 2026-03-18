<script setup lang="ts">
import type { Product } from "~/types/product";
import StorefrontProductCard from "./StorefrontProductCard.vue";
import StorefrontSectionHeader from "./StorefrontSectionHeader.vue";

const props = defineProps<{
  products: Product[];
  stockMap: Record<string, number>;
}>();
</script>

<template>
  <section id="browse-products">
    <StorefrontSectionHeader
      eyebrow="Browse More"
      title="Continue shopping construction supplies"
      description="Search results, stock-backed products, and practical specs stay visible so buyers can keep building a material list without leaving the homepage."
      link-label="See full category directory"
      link-to="/shop/categories"
    />

    <div class="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <StorefrontProductCard
        v-for="product in props.products"
        :key="product.id"
        :product="product"
        :stock="props.stockMap[product.id ?? ''] ?? 0"
        badge="Popular"
        badge-color="neutral"
      />
    </div>
  </section>
</template>
