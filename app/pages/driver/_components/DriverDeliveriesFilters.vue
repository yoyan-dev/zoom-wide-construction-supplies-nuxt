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
      <UFormField label="Search deliveries">
        <UInput
          :model-value="props.search"
          icon="i-lucide-search"
          placeholder="Search delivery, order reference, or vehicle"
          @update:model-value="emit('update:search', String($event ?? ''))"
        />
      </UFormField>

      <UFormField label="Delivery status">
        <USelect
          :model-value="props.status"
          :items="props.statusOptions"
          placeholder="Select status"
          @update:model-value="emit('update:status', String($event ?? 'all'))"
        />
      </UFormField>
    </div>
  </UCard>
</template>
