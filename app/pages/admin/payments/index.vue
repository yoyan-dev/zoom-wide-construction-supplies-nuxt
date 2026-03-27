<script setup lang="ts">
import PaymentsListView from "./_components/PaymentsListView.vue";

definePageMeta({
  layout: "admin",
});
</script>

<template>
  <PaymentsListView
    detail-base-path="/admin/payments"
    order-base-path="/admin/orders"
  />
</template>
