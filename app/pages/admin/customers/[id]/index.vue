<script setup lang="ts">
import CustomerDetailView from "../_components/detail/CustomerDetailView.vue";

definePageMeta({
  layout: "admin",
});

const route = useRoute();
const customerId = computed(() => String(route.params.id));
</script>

<template>
  <CustomerDetailView :customer-id="customerId" />
</template>
