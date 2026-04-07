<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    count?: number;
    columnsClass?: string;
    itemClass?: string;
  }>(),
  {
    count: 6,
    columnsClass: "grid gap-4 sm:grid-cols-2 xl:grid-cols-3",
    itemClass: "h-[320px]",
  },
);
</script>

<template>
  <div :class="props.columnsClass">
    <div
      v-for="index in props.count"
      :key="index"
      class="overflow-hidden rounded-lg border border-slate-300/75 bg-white/90 shadow-[0_20px_40px_rgba(15,23,42,0.05)]"
    >
      <USkeleton :class="['w-full rounded-[inherit]', props.itemClass]" />
    </div>
  </div>
</template>
