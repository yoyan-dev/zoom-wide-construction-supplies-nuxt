<script setup lang="ts">
import DeliveriesListView from "~/pages/admin/deliveries/_components/DeliveriesListView.vue";

definePageMeta({
  layout: "staff",
});
</script>

<template>
  <DeliveriesListView detail-base-path="/staff/deliveries" />
</template>
