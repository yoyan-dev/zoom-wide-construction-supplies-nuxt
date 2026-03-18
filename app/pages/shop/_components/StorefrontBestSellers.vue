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
  <section>
    <StorefrontSectionHeader
      eyebrow="Best Sellers"
      title="Most ordered materials across repeat buyer needs"
      description="Use best-seller signals to spot the items procurement teams and site buyers keep coming back for."
    />

    <div class="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <StorefrontProductCard
        v-for="product in props.products"
        :key="product.id"
        :product="product"
        :stock="props.stockMap[product.id ?? ''] ?? 0"
        badge="Best Seller"
        badge-color="info"
      />
    </div>
  </section>
</template>
