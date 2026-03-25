<script setup lang="ts">
type HeaderActionColor =
  | "primary"
  | "secondary"
  | "success"
  | "info"
  | "warning"
  | "error"
  | "neutral";

const props = withDefaults(
  defineProps<{
    eyebrow: string;
    title: string;
    description: string;
    total?: number;
    totalLabel?: string;
    actionLabel?: string;
    actionIcon?: string;
    actionTo?: string;
    actionColor?: HeaderActionColor;
  }>(),
  {
    total: undefined,
    totalLabel: "",
    actionLabel: "",
    actionIcon: "i-lucide-plus",
    actionTo: undefined,
    actionColor: "primary",
  },
);

const emit = defineEmits<{
  (e: "action"): void;
}>();

const handleAction = () => {
  if (props.actionTo) return;
  emit("action");
};
</script>

<template>
  <section class="bg-white p-2">
    <div
      class="flex flex-col gap-4 md:flex-row md:items-center md:justify-between"
    >
      <div>
        <p class="text-xs uppercase tracking-[0.18em] text-slate-500">
          {{ props.eyebrow }}
        </p>
        <h1 class="mt-2 text-2xl font-semibold">{{ props.title }}</h1>
        <p class="mt-2 text-sm text-slate-600">
          {{ props.description }}
        </p>
      </div>

      <div class="flex flex-wrap items-center gap-3">
        <UBadge
          v-if="props.total !== undefined && props.totalLabel"
          color="primary"
          variant="subtle"
        >
          {{ props.total }} {{ props.totalLabel }}
        </UBadge>
        <UButton
          v-if="props.actionLabel"
          :color="props.actionColor"
          :icon="props.actionIcon"
          :to="props.actionTo"
          @click="handleAction"
        >
          {{ props.actionLabel }}
        </UButton>
      </div>
    </div>
  </section>
</template>
