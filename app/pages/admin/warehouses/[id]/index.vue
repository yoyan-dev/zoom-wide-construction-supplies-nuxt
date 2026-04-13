<script setup lang="ts">
import WarehouseDetailView from "../_components/detail/WarehouseDetailView.vue";

definePageMeta({
  layout: "admin",
});

const route = useRoute();
const warehouseId = computed(() => String(route.params.id ?? ""));
</script>

<template>
  <WarehouseDetailView :warehouse-id="warehouseId" />
</template>
