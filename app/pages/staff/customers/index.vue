<script setup lang="ts">
import CustomersListView from "~/pages/admin/customers/_components/CustomersListView.vue";

definePageMeta({
  layout: "staff",
});
</script>

<template>
  <CustomersListView detail-base-path="/staff/customers" />
</template>
