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
    eyebrow="Suppliers"
    title="Supplier management"
    description="Manage supplier profiles and their linked supplier-role sign-in accounts."
    :total="props.total"
    total-label="suppliers"
    action-label="Create supplier"
    action-icon="i-lucide-building-2"
    @action="emit('create')"
  />
</template>
