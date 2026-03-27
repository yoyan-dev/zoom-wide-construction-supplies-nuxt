<script setup lang="ts">
const props = defineProps<{
  search: string;
  status: string;
  method: string;
  statusOptions: Array<{ label: string; value: string }>;
  methodOptions: Array<{ label: string; value: string }>;
}>();

const emit = defineEmits<{
  (e: "update:search", value: string): void;
  (e: "update:status", value: string): void;
  (e: "update:method", value: string): void;
}>();
</script>

<template>
  <UCard>
    <div class="grid gap-4 md:grid-cols-3">
      <UInput
        :model-value="props.search"
        icon="i-lucide-search"
        placeholder="Search payment ID, order ID, or transaction reference"
        @update:model-value="emit('update:search', String($event))"
      />
      <USelect
        :items="props.statusOptions"
        :model-value="props.status"
        placeholder="All payment status"
        @update:model-value="emit('update:status', String($event))"
      />
      <USelect
        :items="props.methodOptions"
        :model-value="props.method"
        placeholder="All methods"
        @update:model-value="emit('update:method', String($event))"
      />
    </div>
  </UCard>
</template>
