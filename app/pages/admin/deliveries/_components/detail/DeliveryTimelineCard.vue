<script setup lang="ts">
import type { Delivery } from "~/types/delivery";
import DeliveryStatusTimeline from "./DeliveryStatusTimeline.vue";

const props = defineProps<{
  delivery: Delivery;
}>();
</script>

<template>
  <UCard>
    <p class="text-xs uppercase tracking-[0.18em] text-slate-500">
      Fulfillment Timeline
    </p>
    <h2 class="mt-2 text-xl font-semibold text-slate-900">
      Delivery progress
    </h2>
    <p class="mt-2 text-sm text-slate-600">
      This timeline reflects the current delivery status using the supported fulfillment states in the repository.
    </p>

    <div class="mt-6">
      <DeliveryStatusTimeline :delivery="props.delivery" />
    </div>
  </UCard>
</template>
