<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    title?: string;
    description: string;
  }>(),
  {
    title: "Limited access",
  },
);
</script>

<template>
  <UAlert
    color="info"
    variant="soft"
    icon="i-lucide-shield-alert"
    :title="props.title"
    :description="props.description"
  />
</template>
