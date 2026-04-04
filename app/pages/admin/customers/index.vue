<script setup lang="ts">
import CustomersListView from "./_components/CustomersListView.vue";

definePageMeta({
  layout: "admin",
});
</script>

<template>
  <CustomersListView detail-base-path="/admin/customers" />
</template>
