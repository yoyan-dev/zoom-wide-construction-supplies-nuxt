<script setup lang="ts">
import InventoryDetailView from "~/pages/admin/inventory/_components/detail/InventoryDetailView.vue";

definePageMeta({
  layout: "warehouse",
});
</script>

<template>
  <InventoryDetailView back-to="/warehouse/inventory" />
</template>
