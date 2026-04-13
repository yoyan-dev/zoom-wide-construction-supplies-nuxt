<script setup lang="ts">
const props = defineProps<{
  label: string;
  value: string;
  description: string;
}>();
</script>

<template>
  <UCard>
    <p class="text-xs uppercase tracking-[0.18em] text-slate-500">
      {{ props.label }}
    </p>
    <p class="mt-2 text-2xl font-semibold text-slate-900">
      {{ props.value }}
    </p>
    <p class="mt-2 text-sm text-slate-600">
      {{ props.description }}
    </p>
  </UCard>
</template>
