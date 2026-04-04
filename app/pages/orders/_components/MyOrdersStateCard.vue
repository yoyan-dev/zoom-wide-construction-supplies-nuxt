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

const toneClasses = computed(() =>
  props.tone === "error"
    ? "border-rose-200/70 bg-rose-50/60"
    : "border-slate-200/70 bg-white",
);
</script>

<template>
  <section :class="`rounded-sm border p-6 shadow-sm ${toneClasses}`">
    <div class="mx-auto max-w-2xl text-center">
      <p class="text-xs uppercase tracking-[0.18em] text-slate-500">
        {{ props.eyebrow }}
      </p>
      <h2 class="mt-3 text-2xl font-semibold tracking-tight text-slate-900">
        {{ props.title }}
      </h2>
      <p class="mt-3 text-sm leading-7 text-slate-600">
        {{ props.description }}
      </p>

      <div v-if="props.actionLabel" class="mt-6">
        <UButton
          color="primary"
          :loading="props.actionLoading"
          @click="emit('action')"
        >
          {{ props.actionLabel }}
        </UButton>
      </div>
    </div>
  </section>
</template>
