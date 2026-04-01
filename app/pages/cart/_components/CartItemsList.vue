<script setup lang="ts">
import type { CartLineItem } from "~/types/cart";
import CartLineItemRow from "./CartLineItemRow.vue";

defineProps<{
  items: CartLineItem[];
}>();
</script>

<template>
  <section class="space-y-4">
    <div class="flex items-center justify-between gap-4">
      <div>
        <p class="text-xs uppercase tracking-[0.16em] text-slate-500">
          Cart Items
        </p>
        <h2 class="mt-2 text-2xl font-semibold tracking-tight text-slate-900">
          Product Summary
        </h2>
      </div>
    </div>

    <div class="space-y-4">
      <CartLineItemRow
        v-for="item in items"
        :key="item.product_id"
        :item="item"
      />
    </div>
  </section>
</template>
