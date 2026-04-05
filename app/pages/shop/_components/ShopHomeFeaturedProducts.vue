<script setup lang="ts">
import type { Product } from "~/types/product";
import StorefrontSkeletonGrid from "~/components/storefront/StorefrontSkeletonGrid.vue";
import StorefrontStateCard from "~/components/storefront/StorefrontStateCard.vue";
import ShopHomeProductCard from "./ShopHomeProductCard.vue";

const props = defineProps<{
  products: Product[];
  isLoading?: boolean;
  activeCategoryName?: string;
  searchQuery?: string;
  cartQuantities?: Record<string, number>;
  isCartBusy?: boolean;
  hasFilters?: boolean;
}>();

const emit = defineEmits<{
  (e: "addToCart", productId?: string): void;
  (e: "clearFilters"): void;
}>();

const sectionDescription = computed(() => {
  if (props.searchQuery) {
    return `Showing the first live products matching "${props.searchQuery}". This keeps the homepage search useful now and still leaves room for a fuller catalog later.`;
  }

  if (props.activeCategoryName) {
    return `Showing featured items for ${props.activeCategoryName}. Buyers can drill down by category without leaving the home flow.`;
  }

  return "Specification-ready products with clear pricing, stock visibility, and fast add-to-cart actions for repeat supply orders.";
});
</script>

<template>
  <section id="featured" class="py-14 md:py-18">
    <StorefrontPageContainer size="wide">
      <div class="mb-8 flex flex-col gap-4 md:mb-10 md:flex-row md:items-end md:justify-between">
        <StorefrontSectionHeading
          eyebrow="Industrial Specifications"
          title="Popular products with cleaner pricing and stock visibility."
          :description="sectionDescription"
        />

        <StorefrontButton
          v-if="props.hasFilters"
          tone="ghost"
          size="sm"
          @click="emit('clearFilters')"
        >
          Clear filters
        </StorefrontButton>
      </div>

      <StorefrontSkeletonGrid
        v-if="props.isLoading"
        :count="4"
        columns-class="grid gap-5 md:grid-cols-2 xl:grid-cols-4"
      />

      <StorefrontStateCard
        v-else-if="!props.products.length"
        eyebrow="Products"
        title="No featured products match the current filter."
        description="Try clearing the active category or search term to return to the broader storefront selection."
      >
        <template v-if="props.hasFilters" #actions>
          <StorefrontButton tone="secondary" @click="emit('clearFilters')">
            Reset storefront view
          </StorefrontButton>
        </template>
      </StorefrontStateCard>

      <div v-else class="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        <ShopHomeProductCard
          v-for="product in props.products"
          :key="product.id || product.sku || product.name"
          :product="product"
          :category-name="props.activeCategoryName"
          :quantity-in-cart="props.cartQuantities?.[product.id || ''] ?? 0"
          :disabled="props.isCartBusy"
          @add="emit('addToCart', $event)"
        />
      </div>
    </StorefrontPageContainer>
  </section>
</template>
