<script setup lang="ts">
import type { Order } from "~/types/order";
import MyOrderCard from "./MyOrderCard.vue";

defineProps<{
  orders: Order[];
  isLoading: boolean;
}>();
</script>

<template>
  <section class="space-y-5">
    <div class="flex items-center justify-between gap-4">
      <div>
        <p class="text-[0.72rem] font-semibold uppercase tracking-[0.22em] text-amber-700">
          Order History
        </p>
        <h2 class="mt-3 text-3xl font-bold tracking-[-0.04em] text-slate-950">
          Submitted Orders
        </h2>
      </div>
    </div>

    <StorefrontSkeletonList v-if="isLoading" :count="3" item-class="h-[100px]" />

    <div v-else class="space-y-4">
      <MyOrderCard
        v-for="order in orders"
        :key="order.id"
        :order="order"
      />
    </div>
  </section>
</template>
