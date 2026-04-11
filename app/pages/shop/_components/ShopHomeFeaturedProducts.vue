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
  categoryNames?: Record<string, string>;
  isCartBusy?: boolean;
  hasFilters?: boolean;
}>();

const emit = defineEmits<{
  (e: "addToCart", productId?: string): void;
  (e: "clearFilters"): void;
}>();

const sectionDescription = computed(() => {
  if (props.searchQuery) {
    return `Showing the first live products matching "${props.searchQuery}" so buyers can move quickly from search intent to shortlist.`;
  }

  if (props.activeCategoryName) {
    return `Showing featured items for ${props.activeCategoryName} with pricing, stock, and fast cart actions close at hand.`;
  }

  return "Specification-ready products with clear pricing, stock visibility, and fast add-to-cart actions for repeat supply orders.";
});
</script>

<template>
  <section id="featured" class="py-12 md:py-16">
    <StorefrontPageContainer size="wide">
      <div class="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <StorefrontSectionHeading
          eyebrow="Site-Ready Products"
          title="Materials with price, unit, stock, and specs up front."
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
          :category-name="
            props.categoryNames?.[product.category_id || ''] ||
            props.activeCategoryName
          "
          :quantity-in-cart="props.cartQuantities?.[product.id || ''] ?? 0"
          :disabled="props.isCartBusy"
          @add="emit('addToCart', $event)"
        />
      </div>
    </StorefrontPageContainer>
  </section>
</template>
