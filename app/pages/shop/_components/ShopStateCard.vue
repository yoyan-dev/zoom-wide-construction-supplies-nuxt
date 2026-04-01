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
    ? "border border-rose-200/70 bg-rose-50/70"
    : "bg-white/95",
);

const actionColor = computed(() => (props.tone === "error" ? "error" : "neutral"));
</script>

<template>
  <section :class="`rounded-xl p-5 shadow-sm md:p-6 ${toneClasses}`">
    <div
      class="flex flex-col gap-4 md:flex-row md:items-center md:justify-between"
    >
      <div class="max-w-2xl">
        <p class="text-xs uppercase tracking-[0.18em] text-slate-500/90">
          {{ props.eyebrow }}
        </p>
        <h2 class="mt-2 text-xl font-semibold tracking-tight text-slate-900 md:text-2xl">
          {{ props.title }}
        </h2>
        <p class="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
          {{ props.description }}
        </p>
      </div>

      <UButton
        v-if="props.actionLabel"
        :color="actionColor"
        variant="outline"
        :loading="props.actionLoading"
        @click="emit('action')"
      >
        {{ props.actionLabel }}
      </UButton>
    </div>
  </section>
</template>
