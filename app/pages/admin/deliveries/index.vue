<script setup lang="ts">
import { storeToRefs } from "pinia";
import DeliveriesHeader from "./_components/DeliveriesHeader.vue";
import DeliveriesTable from "./_components/DeliveriesTable.vue";

definePageMeta({
  layout: "admin",
});

const deliveryStore = useDeliveryStore();
const driverStore = useDriverStore();

await Promise.all([
  deliveryStore.fetchDeliveries(),
  driverStore.fetchDrivers(),
]);

const { deliveries } = storeToRefs(deliveryStore);
const { drivers } = storeToRefs(driverStore);
</script>

<template>
  <div class="min-h-screen">
    <div class="space-y-6">
      <DeliveriesHeader :total="deliveries.length" />
      <DeliveriesTable :deliveries="deliveries" :drivers="drivers" />
    </div>
  </div>
</template>
