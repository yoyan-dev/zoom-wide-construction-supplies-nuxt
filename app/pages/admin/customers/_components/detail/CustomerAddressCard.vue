<script setup lang="ts">
const props = defineProps<{
  title: string;
  description: string;
  address: string | null;
}>();
</script>

<template>
  <UCard>
    <p class="text-xs uppercase tracking-[0.18em] text-slate-500">
      {{ props.title }}
    </p>
    <h2 class="mt-2 text-xl font-semibold text-slate-900">
      {{ props.title }}
    </h2>
    <p class="mt-3 text-sm leading-6 text-slate-700">
      {{ props.description }}
    </p>

    <div class="mt-6 rounded-2xl border border-slate-200/70 p-4">
      <p class="text-sm leading-7 text-slate-700">
        {{ props.address || "No address has been added for this record yet." }}
      </p>
    </div>
  </UCard>
</template>
