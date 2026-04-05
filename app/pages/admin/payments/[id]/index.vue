<script setup lang="ts">
import PaymentDetailView from "../_components/detail/PaymentDetailView.vue";

definePageMeta({
  layout: "admin",
});
</script>

<template>
  <PaymentDetailView
    back-to="/admin/payments"
    order-base-path="/admin/orders"
  />
</template>
