<script setup lang="ts">
type CheckoutStep = {
  label: string;
  description: string;
};

const props = defineProps<{
  steps: readonly CheckoutStep[];
  activeIndex: number;
}>();
</script>

<template>
  <div class="grid gap-3 md:grid-cols-3">
    <div
      v-for="(step, index) in props.steps"
      :key="step.label"
      class="rounded-lg border p-4 transition"
      :class="
        index <= props.activeIndex
          ? 'border-amber-200 bg-amber-50 text-amber-950'
          : 'border-slate-200 bg-white text-slate-600'
      "
    >
      <div class="flex items-center gap-3">
        <span
          class="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-semibold"
          :class="
            index <= props.activeIndex
              ? 'bg-slate-950 text-white'
              : 'bg-slate-100 text-slate-500'
          "
        >
          {{ index + 1 }}
        </span>
        <div>
          <p class="text-sm font-semibold">
            {{ step.label }}
          </p>
          <p class="mt-1 text-xs leading-5 opacity-75">
            {{ step.description }}
          </p>
        </div>
      </div>
    </div>
  </div>
</template>
