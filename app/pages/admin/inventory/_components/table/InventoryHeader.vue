<script setup lang="ts">
const props = defineProps<{
  total: number;
}>();

const emit = defineEmits<{
  (e: "create"): void;
}>();
</script>

<template>
  <section class="bg-white dark:bg-gray-800 p-2">
    <div
      class="flex flex-col gap-4 md:flex-row md:items-center md:justify-between"
    >
      <div>
        <p class="text-xs uppercase tracking-[0.18em] text-slate-500">
          Stock Movements
        </p>
        <h1 class="mt-2 text-2xl font-semibold">Inventory Activity</h1>
        <p class="mt-2 text-sm text-slate-600">
          Monitor inbound, outbound, and adjustment entries.
        </p>
      </div>

      <div class="flex flex-wrap items-center gap-3">
        <UBadge color="primary" variant="subtle">
          {{ props.total }} records
        </UBadge>
        <UButton color="primary" icon="i-lucide-plus" @click="emit('create')">
          New Adjustment
        </UButton>
      </div>
    </div>
  </section>
</template>
