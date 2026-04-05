<script setup lang="ts">
type PageStateTone = "info" | "error";

type PageStateActionColor =
  | "primary"
  | "secondary"
  | "success"
  | "info"
  | "warning"
  | "error"
  | "neutral";

const props = withDefaults(
  defineProps<{
    eyebrow?: string;
    title: string;
    description: string;
    tone?: PageStateTone;
    actionLabel?: string;
    actionIcon?: string;
    actionColor?: PageStateActionColor;
    actionLoading?: boolean;
  }>(),
  {
    eyebrow: "Status",
    tone: "info",
    actionLabel: "",
    actionIcon: "i-lucide-refresh-cw",
    actionColor: "primary",
    actionLoading: false,
  },
);

const emit = defineEmits<{
  (e: "action"): void;
}>();

const iconName = computed(() =>
  props.tone === "error"
    ? "i-lucide-circle-alert"
    : "i-lucide-file-search",
);

const iconColorClass = computed(() =>
  props.tone === "error"
    ? "text-rose-600 bg-rose-50"
    : "text-sky-600 bg-sky-50",
);
</script>

<template>
  <UCard>
    <div class="flex min-h-64 items-center justify-center px-4 py-8">
      <div class="mx-auto max-w-lg text-center">
        <div
          class="mx-auto flex h-14 w-14 items-center justify-center rounded-full"
          :class="iconColorClass"
        >
          <UIcon :name="iconName" class="h-6 w-6" />
        </div>

        <p class="mt-5 text-xs uppercase tracking-[0.18em] text-slate-500">
          {{ props.eyebrow }}
        </p>
        <h2 class="mt-2 text-xl font-semibold text-slate-900">
          {{ props.title }}
        </h2>
        <p class="mt-3 text-sm leading-6 text-slate-600">
          {{ props.description }}
        </p>

        <div v-if="props.actionLabel" class="mt-6">
          <UButton
            :color="props.actionColor"
            :icon="props.actionIcon"
            :loading="props.actionLoading"
            @click="emit('action')"
          >
            {{ props.actionLabel }}
          </UButton>
        </div>
      </div>
    </div>
  </UCard>
</template>
