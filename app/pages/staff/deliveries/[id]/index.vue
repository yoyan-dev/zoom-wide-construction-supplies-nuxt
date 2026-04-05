<script setup lang="ts">
import DeliveryDetailView from "~/pages/admin/deliveries/_components/detail/DeliveryDetailView.vue";

definePageMeta({
  layout: "staff",
});
</script>

<template>
  <DeliveryDetailView back-to="/staff/deliveries" />
</template>
