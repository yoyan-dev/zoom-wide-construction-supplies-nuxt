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
    eyebrow="Customer Accounts"
    title="Customer Management"
    description="Manage customer records, contact details, and account context for admin and staff workflows."
    :total="props.total"
    total-label="customers"
    action-label="New Customer"
    @action="emit('create')"
  />
</template>
