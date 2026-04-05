<script setup lang="ts">
const props = defineProps<{
  search: string;
  categoryId: string;
  stockStatus: string;
  status: string;
  categoryOptions: Array<{ label: string; value: string }>;
}>();

const emit = defineEmits<{
  (e: "update:search", value: string): void;
  (e: "update:categoryId", value: string): void;
  (e: "update:stockStatus", value: string): void;
  (e: "update:status", value: string): void;
}>();

const stockOptions = [
  { label: "All stock", value: "all" },
  { label: "Low stock", value: "low" },
  { label: "Healthy stock", value: "healthy" },
  { label: "Out of stock", value: "out" },
];

const statusOptions = [
  { label: "All status", value: "all" },
  { label: "Active only", value: "active" },
  { label: "Inactive only", value: "inactive" },
];
</script>

<template>
  <UCard>
    <div class="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      <UInput
        :model-value="props.search"
        icon="i-lucide-search"
        placeholder="Search products, SKU, or handbook notes"
        @update:model-value="emit('update:search', $event)"
      />
      <USelect
        :items="props.categoryOptions"
        :model-value="props.categoryId"
        placeholder="All categories"
        @update:model-value="emit('update:categoryId', String($event))"
      />
      <USelect
        :items="stockOptions"
        :model-value="props.stockStatus"
        placeholder="All stock"
        @update:model-value="emit('update:stockStatus', String($event))"
      />
      <USelect
        :items="statusOptions"
        :model-value="props.status"
        placeholder="All status"
        @update:model-value="emit('update:status', String($event))"
      />
    </div>
  </UCard>
</template>
