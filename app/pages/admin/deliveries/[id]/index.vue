<script setup lang="ts">
import DeliveryDetailView from "../_components/detail/DeliveryDetailView.vue";

definePageMeta({
  layout: "admin",
});
</script>

<template>
  <DeliveryDetailView back-to="/admin/deliveries" />
</template>
