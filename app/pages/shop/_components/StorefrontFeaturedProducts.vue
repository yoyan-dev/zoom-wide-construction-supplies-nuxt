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
      eyebrow="Featured Materials"
      title="Quick picks for active construction buying"
      description="A scannable lane of popular materials buyers usually compare first when sourcing for current works."
    />

    <div class="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <StorefrontProductCard
        v-for="product in props.products"
        :key="product.id"
        :product="product"
        :stock="props.stockMap[product.id ?? ''] ?? 0"
        badge="Featured"
        badge-color="warning"
      />
    </div>
  </section>
</template>
