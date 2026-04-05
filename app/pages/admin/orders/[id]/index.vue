<script setup lang="ts">
import OrderDetailView from "../_components/detail/OrderDetailView.vue";

definePageMeta({
  layout: "admin",
});
</script>

<template>
  <OrderDetailView back-to="/admin/orders" />
</template>
