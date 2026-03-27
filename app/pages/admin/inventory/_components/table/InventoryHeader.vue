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
    eyebrow="Inventory Operations"
    title="Inventory Management"
    description="Review stock visibility, movement history, warehouse context, and low-stock operational signals."
    :total="props.total"
    total-label="inventory records"
    action-label="Record Movement"
    @action="emit('create')"
  />
</template>
