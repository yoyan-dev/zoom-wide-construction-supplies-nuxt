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
    eyebrow="Product Suppliers"
    title="Supplier Management"
    description="Manage supplier records and keep purchasing contacts easy to maintain."
    :total="props.total"
    total-label="suppliers"
    action-label="New Supplier"
    @action="emit('create')"
  />
</template>
