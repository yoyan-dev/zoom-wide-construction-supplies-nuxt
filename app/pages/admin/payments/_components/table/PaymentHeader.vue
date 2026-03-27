<script setup lang="ts">
import AdminPageHeader from "../../../_components/AdminPageHeader.vue";

const props = defineProps<{
  total: number;
}>();
</script>

<template>
  <AdminPageHeader
    eyebrow="Finance Visibility"
    title="Payments"
    description="Review payment records, status visibility, finance summary signals, and related order context."
    :total="props.total"
    total-label="payment records"
  />
</template>
