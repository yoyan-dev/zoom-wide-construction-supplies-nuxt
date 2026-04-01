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
  <UCard class="rounded-[24px] border border-slate-200/70 bg-white/95 shadow-sm">
    <div class="space-y-4">
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

      <div class="flex flex-wrap gap-2">
        <UButton
          v-for="option in props.statusOptions"
          :key="option.value"
          color="neutral"
          size="sm"
          :variant="option.value === props.status ? 'solid' : 'soft'"
          @click="emit('update:status', option.value)"
        >
          {{ option.label }}
        </UButton>
      </div>
    </div>
  </UCard>
</template>
