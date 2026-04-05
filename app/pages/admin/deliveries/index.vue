<script setup lang="ts">
import DeliveriesListView from "./_components/DeliveriesListView.vue";

definePageMeta({
  layout: "admin",
});
</script>

<template>
  <DeliveriesListView detail-base-path="/admin/deliveries" />
</template>
