<script setup lang="ts">
import { storeToRefs } from "pinia";
import CartEmptyState from "./CartEmptyState.vue";
import CartHeader from "./CartHeader.vue";
import CartItemsList from "./CartItemsList.vue";
import CartSummaryCard from "./CartSummaryCard.vue";

const cartStore = useCartStore();
const { items, hasItems, distinctItemCount, itemCount, subtotal } =
  storeToRefs(cartStore);
</script>

<template>
  <div class="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-5 sm:px-6 sm:py-6 lg:px-8">
    <CartHeader
      :distinct-item-count="distinctItemCount"
      :item-count="itemCount"
    />

    <CartEmptyState v-if="!hasItems" />

    <div
      v-else
      class="grid gap-6 xl:grid-cols-[minmax(0,1.25fr)_minmax(320px,0.85fr)] xl:items-start"
    >
      <CartItemsList :items="items" />
      <CartSummaryCard
        :distinct-item-count="distinctItemCount"
        :item-count="itemCount"
        :subtotal="subtotal"
      />
    </div>
  </div>
</template>
