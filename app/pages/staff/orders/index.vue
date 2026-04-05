<script setup lang="ts">
import OrdersListView from "../../admin/orders/_components/OrdersListView.vue";

definePageMeta({
  layout: "staff",
});
</script>

<template>
  <OrdersListView detail-base-path="/staff/orders" />
</template>
