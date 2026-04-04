<script setup lang="ts">
import CustomerDetailView from "~/pages/admin/customers/_components/detail/CustomerDetailView.vue";

const route = useRoute();
const customerId = computed(() => String(route.params.id));

definePageMeta({
  layout: "staff",
});
</script>

<template>
  <CustomerDetailView :customer-id="customerId" back-to="/staff/customers" />
</template>
