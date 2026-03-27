<script setup lang="ts">
import InventoryListView from "./_components/InventoryListView.vue";

definePageMeta({
  layout: "admin",
});
</script>

<template>
  <InventoryListView
    detail-base-path="/admin/inventory"
    product-base-path="/admin/products"
  />
</template>
