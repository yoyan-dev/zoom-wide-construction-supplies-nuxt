<script setup lang="ts">
const props = defineProps<{
  title: string;
  description: string;
}>();
</script>

<template>
  <div
    class="flex flex-col items-center justify-center rounded-sm border border-dashed border-slate-200 bg-white px-6 py-12 text-center dark:bg-gray-900"
  >
    <div
      class="flex h-12 w-12 items-center justify-center rounded-full bg-white text-slate-400 ring-1 ring-slate-200"
    >
      <UIcon name="i-lucide-table-properties" class="h-5 w-5" />
    </div>
    <h3 class="mt-4 text-base font-semibold text-slate-900">
      {{ props.title }}
    </h3>
    <p class="mt-2 max-w-md text-sm text-slate-600">
      {{ props.description }}
    </p>
  </div>
</template>
