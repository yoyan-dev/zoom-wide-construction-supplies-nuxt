<script setup lang="ts">
const props = defineProps<{
  search: string;
  status: string;
  statusOptions: Array<{ label: string; value: string }>;
}>();

const emit = defineEmits<{
  (e: "update:search", value: string): void;
  (e: "update:status", value: string): void;
}>();
</script>

<template>
  <UCard>
    <div class="grid gap-4 md:grid-cols-2">
      <UInput
        :model-value="props.search"
        icon="i-lucide-search"
        placeholder="Search order ID, customer ID, or notes"
        @update:model-value="emit('update:search', String($event))"
      />
      <USelect
        :items="props.statusOptions"
        :model-value="props.status"
        placeholder="All status"
        @update:model-value="emit('update:status', String($event))"
      />
    </div>
  </UCard>
</template>
