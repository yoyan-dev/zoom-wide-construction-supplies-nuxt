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
    eyebrow="Product Categories"
    title="Category Management"
    description="Organize catalog structure and keep product taxonomy consistent."
    :total="props.total"
    total-label="categories"
    action-label="New Category"
    @action="emit('create')"
  />
</template>
