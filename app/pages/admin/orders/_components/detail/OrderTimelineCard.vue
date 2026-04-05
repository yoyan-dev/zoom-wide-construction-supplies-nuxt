<script setup lang="ts">
import type { Order } from "~/types/order";
import OrderStatusTimeline from "../../../../orders/_components/shared/OrderStatusTimeline.vue";

const props = defineProps<{
  order: Order;
}>();
</script>

<template>
  <UCard>
    <div>
      <p class="text-xs uppercase tracking-[0.18em] text-slate-500">
        Status Timeline
      </p>
      <h2 class="mt-2 text-xl font-semibold text-slate-900">
        Tracking Foundation
      </h2>
      <p class="mt-2 text-sm text-slate-600">
        This timeline is currently based on order status and available timestamps.
      </p>
    </div>

    <div class="mt-6">
      <OrderStatusTimeline :order="props.order" />
    </div>
  </UCard>
</template>
