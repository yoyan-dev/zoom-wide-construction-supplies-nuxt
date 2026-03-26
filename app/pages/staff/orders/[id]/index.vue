<script setup lang="ts">
import OrderDetailView from "../../../admin/orders/_components/detail/OrderDetailView.vue";

definePageMeta({
  layout: "staff",
});
</script>

<template>
  <OrderDetailView back-to="/staff/orders" />
</template>
