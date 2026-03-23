<script setup lang="ts">
import type { StaffStat, StaffTone } from "./staff-dashboard.types";

const props = defineProps<{
  stat: StaffStat;
}>();

const iconClasses: Record<StaffTone, string> = {
  primary: "bg-blue-100 text-blue-700",
  secondary: "bg-violet-100 text-violet-700",
  success: "bg-emerald-100 text-emerald-700",
  info: "bg-sky-100 text-sky-700",
  warning: "bg-amber-100 text-amber-700",
  error: "bg-rose-100 text-rose-700",
  neutral: "bg-slate-100 text-slate-700",
};
</script>

<template>
  <UCard class="h-full">
    <div class="flex items-start justify-between gap-4">
      <div>
        <p class="text-xs uppercase tracking-[0.18em] text-slate-500">
          {{ props.stat.label }}
        </p>
        <p class="mt-2 text-2xl font-semibold text-slate-900">
          {{ props.stat.value }}
        </p>
        <p class="mt-2 text-sm text-slate-600">
          {{ props.stat.description }}
        </p>
      </div>

      <div
        class="flex h-11 w-11 items-center justify-center rounded-2xl"
        :class="iconClasses[props.stat.tone]"
      >
        <UIcon :name="props.stat.icon" class="h-5 w-5" />
      </div>
    </div>

    <div class="mt-4">
      <UBadge :color="props.stat.tone" variant="subtle">
        {{ props.stat.change }}
      </UBadge>
    </div>
  </UCard>
</template>
