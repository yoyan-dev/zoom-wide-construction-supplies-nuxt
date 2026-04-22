<script setup lang="ts">
import SupplierDetailView from "../_components/detail/SupplierDetailView.vue";

definePageMeta({
  layout: "admin",
});

const route = useRoute();
const supplierId = computed(() => String(route.params.id));
</script>

<template>
  <SupplierDetailView :supplier-id="supplierId" />
</template>
