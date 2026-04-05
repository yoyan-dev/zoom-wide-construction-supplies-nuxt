<script setup lang="ts">
import type { Delivery } from "~/types/delivery";
import { formatLongDate } from "~/utils/format";
import {
  buildDeliveryTimelineEntries,
  type DeliveryTimelineState,
} from "./delivery-status";

const props = defineProps<{
  delivery: Delivery;
}>();

const timelineEntries = computed(() => buildDeliveryTimelineEntries(props.delivery));

const markerClass = (state: DeliveryTimelineState) => {
  switch (state) {
    case "complete":
      return "bg-emerald-500";
    case "current":
      return "bg-sky-500";
    case "error":
      return "bg-rose-500";
    case "neutral":
      return "bg-slate-400";
    default:
      return "bg-slate-200";
  }
};

const titleClass = (state: DeliveryTimelineState) => {
  switch (state) {
    case "error":
      return "text-rose-700";
    case "current":
      return "text-sky-700";
    default:
      return "text-slate-900";
  }
};
</script>

<template>
  <div class="space-y-4">
    <div
      v-for="(entry, index) in timelineEntries"
      :key="entry.key"
      class="flex gap-4"
    >
      <div class="flex flex-col items-center">
        <div class="h-3 w-3 rounded-full" :class="markerClass(entry.state)" />
        <div
          v-if="index < timelineEntries.length - 1"
          class="mt-2 h-full min-h-10 w-px bg-slate-200"
        />
      </div>

      <div class="pb-4">
        <p class="font-medium" :class="titleClass(entry.state)">
          {{ entry.title }}
        </p>
        <p class="mt-1 text-sm leading-6 text-slate-600">
          {{ entry.description }}
        </p>
        <p
          v-if="entry.date"
          class="mt-2 text-xs uppercase tracking-[0.18em] text-slate-500"
        >
          {{ formatLongDate(entry.date) }}
        </p>
      </div>
    </div>
  </div>
</template>
