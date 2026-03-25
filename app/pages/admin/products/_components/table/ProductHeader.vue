<script setup lang="ts">
import AdminPageHeader from "../../../_components/AdminPageHeader.vue";

const props = defineProps<{
  total: number;
}>();
</script>

<template>
  <AdminPageHeader
    eyebrow="Catalog Inventory"
    title="Product Management"
    description="Manage catalog items, pricing, supplier context, and stock visibility."
    :total="props.total"
    total-label="products"
    action-label="Add Product"
    action-to="/admin/products/add"
  />
</template>
