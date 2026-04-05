<script setup lang="ts">
type StateTone = "info" | "error";

const props = withDefaults(
  defineProps<{
    eyebrow?: string;
    title: string;
    description: string;
    tone?: StateTone;
    actionLabel?: string;
    actionLoading?: boolean;
  }>(),
  {
    eyebrow: "Status",
    tone: "info",
    actionLabel: "",
    actionLoading: false,
  },
);

const emit = defineEmits<{
  (e: "action"): void;
}>();
</script>

<template>
  <StorefrontStateCard
    :eyebrow="props.eyebrow"
    :title="props.title"
    :description="props.description"
    :tone="props.tone === 'error' ? 'error' : 'neutral'"
    align="center"
  >
    <template v-if="$slots.actions" #actions>
      <slot name="actions" />
    </template>

    <template v-else-if="props.actionLabel" #actions>
      <StorefrontButton
        tone="primary"
        :loading="props.actionLoading"
        @click="emit('action')"
      >
        {{ props.actionLabel }}
      </StorefrontButton>
    </template>
  </StorefrontStateCard>
</template>
