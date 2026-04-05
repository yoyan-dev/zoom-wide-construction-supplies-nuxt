<script setup lang="ts">
import InventoryDetailView from "../_components/detail/InventoryDetailView.vue";

definePageMeta({
  layout: "admin",
});
</script>

<template>
  <InventoryDetailView
    back-to="/admin/inventory"
    product-base-path="/admin/products"
  />
</template>
