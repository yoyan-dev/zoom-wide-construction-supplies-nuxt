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
    eyebrow="Internal Users"
    title="Internal user management"
    description="Manage admin-only internal accounts. Customers and drivers stay in their own dedicated modules."
    :total="props.total"
    total-label="internal users"
    action-label="Create user"
    action-icon="i-lucide-user-plus"
    @action="emit('create')"
  />
</template>
