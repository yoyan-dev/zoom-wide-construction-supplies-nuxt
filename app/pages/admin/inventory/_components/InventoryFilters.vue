<script setup lang="ts">
const props = defineProps<{
  search: string;
  stockStatus: string;
  stockStatusOptions: Array<{ label: string; value: string }>;
}>();

const emit = defineEmits<{
  (e: "update:search", value: string): void;
  (e: "update:stock-status", value: string): void;
}>();
</script>

<template>
  <UCard>
    <div class="grid gap-4 md:grid-cols-2">
      <UInput
        :model-value="props.search"
        icon="i-lucide-search"
        placeholder="Search product name or SKU"
        @update:model-value="emit('update:search', String($event))"
      />
      <USelect
        :items="props.stockStatusOptions"
        :model-value="props.stockStatus"
        placeholder="All stock levels"
        @update:model-value="emit('update:stock-status', String($event))"
      />
    </div>
  </UCard>
</template>
