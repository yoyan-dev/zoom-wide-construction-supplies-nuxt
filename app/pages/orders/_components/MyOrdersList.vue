<script setup lang="ts">
import type { Order } from "~/types/order";
import MyOrderCard from "./MyOrderCard.vue";

defineProps<{
  orders: Order[];
  isLoading: boolean;
}>();
</script>

<template>
  <section class="space-y-4">
    <div class="flex items-center justify-between gap-4">
      <div>
        <p class="text-xs uppercase tracking-[0.18em] text-slate-500">
          Order History
        </p>
        <h2 class="mt-2 text-xl font-semibold text-slate-900">
          Submitted Orders
        </h2>
      </div>
    </div>

    <div v-if="isLoading" class="space-y-4">
      <UCard v-for="index in 3" :key="index">
        <div class="space-y-4">
          <USkeleton class="h-5 w-40" />
          <USkeleton class="h-4 w-full" />
          <USkeleton class="h-4 w-32" />
        </div>
      </UCard>
    </div>

    <div v-else class="space-y-4">
      <MyOrderCard
        v-for="order in orders"
        :key="order.id"
        :order="order"
      />
    </div>
  </section>
</template>
