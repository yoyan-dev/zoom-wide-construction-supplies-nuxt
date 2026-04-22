<script setup lang="ts">
import CustomersListView from "../customers/_components/CustomersListView.vue";

definePageMeta({
  layout: "admin",
});
</script>

<template>
  <CustomersListView
    detail-base-path="/admin/contractors"
    customer-type="contractor"
  />
</template>
