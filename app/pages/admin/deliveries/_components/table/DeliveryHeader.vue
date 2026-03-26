<script setup lang="ts">
import AdminPageHeader from "../../../_components/AdminPageHeader.vue";

const props = defineProps<{
  total: number;
}>();
</script>

<template>
  <AdminPageHeader
    eyebrow="Fulfillment Operations"
    title="Delivery Management"
    description="Review linked orders, assignment context, scheduling dates, and current delivery progress."
    :total="props.total"
    total-label="deliveries"
  />
</template>
