<script setup lang="ts">
import InventoryListView from "~/pages/admin/inventory/_components/InventoryListView.vue";

definePageMeta({
  layout: "warehouse",
});
</script>

<template>
  <InventoryListView detail-base-path="/warehouse/inventory" />
</template>
