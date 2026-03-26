<script setup lang="ts">
type StateTone = "neutral" | "error";

const props = withDefaults(
  defineProps<{
    eyebrow: string;
    title: string;
    description: string;
    tone?: StateTone;
    actionLabel?: string;
    actionLoading?: boolean;
  }>(),
  {
    tone: "neutral",
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
  <section :class="`rounded-[28px] border p-6 shadow-sm ${toneClasses}`">
    <div class="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
      <div>
        <p class="text-xs uppercase tracking-[0.18em] text-slate-500">
          {{ props.eyebrow }}
        </p>
        <h2 class="mt-2 text-2xl font-semibold text-slate-900">
          {{ props.title }}
        </h2>
        <p class="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
          {{ props.description }}
        </p>
      </div>

      <UButton
        v-if="props.actionLabel"
        color="neutral"
        variant="outline"
        :loading="props.actionLoading"
        @click="emit('action')"
      >
        {{ props.actionLabel }}
      </UButton>
    </div>
  </section>
</template>
