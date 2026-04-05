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
    <div v-for="index in props.count" :key="index" class="sf-card p-5 md:p-6">
      <div class="space-y-4">
        <USkeleton class="h-5 w-40 rounded-lg" />
        <USkeleton class="h-4 w-full rounded-lg" />
        <USkeleton class="h-4 w-32 rounded-lg" />
        <USkeleton :class="['w-full rounded-lg', props.itemClass]" />
      </div>
    </div>
  </div>
</template>
