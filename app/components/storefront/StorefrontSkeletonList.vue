<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    count?: number;
    itemClass?: string;
  }>(),
  {
    count: 3,
    itemClass: "h-[150px]",
  },
);
</script>

<template>
  <div class="space-y-4">
    <div
      v-for="index in props.count"
      :key="index"
      class="rounded-lg border border-slate-300/75 bg-white/90 p-5 shadow-[0_20px_40px_rgba(15,23,42,0.05)] md:p-6"
    >
      <div class="space-y-4">
        <USkeleton class="h-5 w-40 rounded-lg" />
        <USkeleton class="h-4 w-full rounded-lg" />
        <USkeleton class="h-4 w-32 rounded-lg" />
        <USkeleton :class="['w-full rounded-lg', props.itemClass]" />
      </div>
    </div>
  </div>
</template>
