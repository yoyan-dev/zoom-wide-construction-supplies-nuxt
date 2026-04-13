<script setup lang="ts">
import AdminPageHeader from "../../../_components/AdminPageHeader.vue";

const props = defineProps<{
  total: number;
  canCreate: boolean;
}>();

const emit = defineEmits<{
  (e: "create"): void;
}>();
</script>

<template>
  <AdminPageHeader
    eyebrow="Warehouses"
    title="Warehouse management"
    description="Manage stock locations used by products, inventory, and fulfillment workflows."
    :total="props.total"
    total-label="warehouses"
    :action-label="props.canCreate ? 'Create warehouse' : ''"
    action-icon="i-lucide-warehouse"
    @action="emit('create')"
  />
</template>
