<script setup lang="ts">
import type { StaffActivity, StaffTone } from "./staff-dashboard.types";

defineProps<{
  items: StaffActivity[];
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
  <UCard>
    <div class="flex items-start justify-between gap-4">
      <div>
        <p class="text-xs uppercase tracking-[0.18em] text-slate-500">
          Recent Activity
        </p>
        <p class="mt-1 text-lg font-semibold">Latest operational updates</p>
      </div>
      <div
        class="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-100 text-slate-700"
      >
        <UIcon name="i-lucide-history" class="h-5 w-5" />
      </div>
    </div>

    <div class="mt-5 space-y-4">
      <div v-for="item in items" :key="item.id" class="flex gap-3">
        <div class="flex flex-col items-center">
          <div
            class="flex h-10 w-10 items-center justify-center rounded-xl"
            :class="iconClasses[item.tone]"
          >
            <UIcon :name="item.icon" class="h-5 w-5" />
          </div>
          <div class="mt-2 h-full w-px bg-slate-200" />
        </div>

        <div class="pb-4">
          <div class="flex flex-wrap items-center gap-2">
            <p class="text-sm font-semibold text-slate-900">
              {{ item.title }}
            </p>
            <span class="text-xs uppercase tracking-[0.14em] text-slate-500">
              {{ item.time }}
            </span>
          </div>
          <p class="mt-2 text-sm leading-6 text-slate-600">
            {{ item.detail }}
          </p>
        </div>
      </div>
    </div>
  </UCard>
</template>
