<script setup lang="ts">
import OrdersListView from "./_components/OrdersListView.vue";

definePageMeta({
  layout: "admin",
});
</script>

<template>
  <OrdersListView detail-base-path="/admin/orders" />
</template>
