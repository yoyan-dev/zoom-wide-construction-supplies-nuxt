<script setup lang="ts">
import DriverDeliveriesPageView from "./_components/DriverDeliveriesPageView.vue";

definePageMeta({
  layout: "driver",
});
</script>

<template>
  <DriverDeliveriesPageView scope="completed" />
</template>
