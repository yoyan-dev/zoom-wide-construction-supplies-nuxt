<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    count: number;
    itemLabel: string;
    actionLabel?: string;
  }>(),
  {
    actionLabel: "Delete selected",
  },
);

const emit = defineEmits<{
  (e: "action"): void;
}>();
</script>

<template>
  <div class="mb-4 flex items-center justify-between">
    <p class="text-xs text-slate-500">
      Selected {{ props.count }} {{ props.itemLabel }}
    </p>
    <UButton
      color="error"
      variant="outline"
      icon="i-lucide-trash-2"
      @click="emit('action')"
    >
      {{ props.actionLabel }}
    </UButton>
  </div>
</template>
