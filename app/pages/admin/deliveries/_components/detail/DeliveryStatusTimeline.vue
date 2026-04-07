<script setup lang="ts">
import type { Delivery } from "~/types/delivery";
import { buildDeliveryTimelineEntries } from "./delivery-status";

const props = defineProps<{
  delivery: Delivery;
}>();

const entries = computed(() => buildDeliveryTimelineEntries(props.delivery));

const markerClasses = (state: string) => {
  switch (state) {
    case "complete":
      return "border-emerald-200 bg-emerald-50 text-emerald-700";
    case "current":
      return "border-sky-200 bg-sky-50 text-sky-700";
    case "error":
      return "border-rose-200 bg-rose-50 text-rose-700";
    case "neutral":
      return "border-slate-200 bg-slate-100 text-slate-700";
    default:
      return "border-slate-200 bg-white text-slate-500";
  }
};
</script>

<template>
  <ol class="space-y-4">
    <li
      v-for="entry in entries"
      :key="entry.key"
      class="flex items-start gap-4"
    >
      <div
        class="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border text-xs font-semibold"
        :class="markerClasses(entry.state)"
      >
        {{ entry.label.slice(0, 1) }}
      </div>

      <div class="min-w-0">
        <p class="font-medium text-slate-900">
          {{ entry.label }}
        </p>
        <p class="mt-1 text-sm leading-6 text-slate-600">
          {{ entry.description }}
        </p>
      </div>
    </li>
  </ol>
</template>
