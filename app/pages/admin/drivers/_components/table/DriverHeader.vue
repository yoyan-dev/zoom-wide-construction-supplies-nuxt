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
    eyebrow="Drivers"
    title="Driver management"
    description="Manage driver accounts separately from internal users and customer accounts."
    :total="props.total"
    total-label="drivers"
    action-label="Create driver"
    action-icon="i-lucide-car-front"
    @action="emit('create')"
  />
</template>
