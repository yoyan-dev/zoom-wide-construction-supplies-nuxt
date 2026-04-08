<script setup lang="ts">
import { formatCurrency } from "~/utils/format";

const props = withDefaults(
  defineProps<{
    amount: number;
    unit?: string;
    eyebrow?: string;
    size?: "sm" | "md" | "lg";
  }>(),
  {
    unit: "",
    eyebrow: "",
    size: "md",
  },
);

const amountClass = computed(() => {
  switch (props.size) {
    case "sm":
      return "text-xl";
    case "lg":
      return "text-4xl md:text-5xl";
    default:
      return "text-2xl md:text-3xl";
  }
});
</script>

<template>
  <div>
    <p
      v-if="props.eyebrow"
      class="text-[0.68rem] font-semibold uppercase tracking-[0.16em] text-slate-500"
    >
      {{ props.eyebrow }}
    </p>
    <p :class="['font-semibold tracking-tight text-slate-950', amountClass]">
      {{ formatCurrency(props.amount) }}
    </p>
    <p
      v-if="props.unit"
      class="mt-1 text-xs font-semibold uppercase tracking-[0.14em] text-slate-500"
    >
      per {{ props.unit }}
    </p>
  </div>
</template>
