<script setup lang="ts">
import AdminPageHeader from "../../../_components/AdminPageHeader.vue";

const props = defineProps<{
  total: number;
}>();
</script>

<template>
  <AdminPageHeader
    eyebrow="Order Operations"
    title="Order Management"
    description="Review submitted orders, customer context, totals, and current status for admin and staff workflows."
    :total="props.total"
    total-label="orders"
  />
</template>
