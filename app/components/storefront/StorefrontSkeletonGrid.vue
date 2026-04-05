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
    <div v-for="index in props.count" :key="index" class="sf-card overflow-hidden">
      <USkeleton :class="['w-full rounded-[inherit]', props.itemClass]" />
    </div>
  </div>
</template>
