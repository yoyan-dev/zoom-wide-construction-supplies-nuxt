<script setup lang="ts">
import AdminPageHeader from "../../../_components/AdminPageHeader.vue";

const props = defineProps<{
  total: number;
}>();

const emit = defineEmits<{
  (e: "create"): void;
}>();
</script>

<template>
  <AdminPageHeader
    eyebrow="Fulfillment Operations"
    title="Delivery Management"
    description="Review linked orders, assignment context, scheduling dates, and current delivery progress."
    :total="props.total"
    total-label="deliveries"
    action-label="New Delivery"
    @action="emit('create')"
  />
</template>
