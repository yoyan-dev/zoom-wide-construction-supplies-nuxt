<script setup lang="ts">
import { storeToRefs } from "pinia";
import DriversHeader from "./_components/DriversHeader.vue";
import DriversTable from "./_components/DriversTable.vue";

definePageMeta({
  layout: "admin",
});

const driverStore = useDriverStore();

await driverStore.fetchDrivers();

const { drivers } = storeToRefs(driverStore);
</script>

<template>
  <div class="min-h-screen">
    <div class="space-y-6">
      <DriversHeader :total="drivers.length" />
      <DriversTable :drivers="drivers" />
    </div>
  </div>
</template>
