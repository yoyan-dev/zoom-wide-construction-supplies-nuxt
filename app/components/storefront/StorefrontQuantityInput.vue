<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    quantity: number;
    min?: number;
    max?: number | null;
    disabled?: boolean;
    label?: string;
  }>(),
  {
    min: 1,
    max: null,
    disabled: false,
    label: "Quantity",
  },
);

const emit = defineEmits<{
  (e: "increase"): void;
  (e: "decrease"): void;
}>();

const canDecrease = computed(
  () => !props.disabled && props.quantity > props.min,
);

const canIncrease = computed(
  () =>
    !props.disabled &&
    (props.max === null || props.max === undefined || props.quantity < props.max),
);
</script>

<template>
  <div class="inline-flex flex-col gap-2">
    <span class="sr-only">{{ props.label }}</span>
    <div class="flex items-center rounded-lg border border-slate-200 bg-white p-1">
      <button
        type="button"
        class="flex h-10 w-10 items-center justify-center rounded-md text-slate-700 transition hover:bg-slate-50 hover:text-slate-950 disabled:cursor-not-allowed disabled:text-slate-300"
        :disabled="!canDecrease"
        :aria-label="`Decrease ${props.label.toLowerCase()}`"
        @click="emit('decrease')"
      >
        <UIcon name="i-lucide-minus" class="text-sm" />
      </button>
      <span class="min-w-12 text-center text-sm font-semibold text-slate-950">
        {{ props.quantity }}
      </span>
      <button
        type="button"
        class="flex h-10 w-10 items-center justify-center rounded-md text-slate-700 transition hover:bg-slate-50 hover:text-slate-950 disabled:cursor-not-allowed disabled:text-slate-300"
        :disabled="!canIncrease"
        :aria-label="`Increase ${props.label.toLowerCase()}`"
        @click="emit('increase')"
      >
        <UIcon name="i-lucide-plus" class="text-sm" />
      </button>
    </div>
  </div>
</template>
