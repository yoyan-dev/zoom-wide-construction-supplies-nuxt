<script setup lang="ts">
const props = defineProps<{
  search: string;
}>();

const emit = defineEmits<{
  (e: "update:search", value: string): void;
}>();
</script>

<template>
  <UCard class="bg-white dark:bg-gray-900 rounded-sm">
    <div class="grid gap-4 md:grid-cols-[minmax(0,320px)_1fr]">
      <UInput
        :model-value="props.search"
        icon="i-lucide-search"
        placeholder="Search categories"
        @update:model-value="emit('update:search', String($event))"
      />
    </div>
  </UCard>
</template>
