<script setup lang="ts">
import { formatLongDate } from "~/utils/format";

const props = defineProps<{
  rangeLabel: string;
  generatedAt: string;
}>();

const updatedAt = computed(() => formatLongDate(props.generatedAt));
</script>

<template>
  <section
    class="rounded-3xl border border-slate-200/70 bg-[radial-gradient(circle_at_top,_#fff7ed,_#f8fafc_45%,_#eef2ff_120%)] p-6 shadow-sm md:p-8"
  >
    <div
      class="flex flex-col gap-6 md:flex-row md:items-center md:justify-between"
    >
      <div class="space-y-2">
        <p class="text-xs uppercase tracking-[0.2em] text-slate-500">
          Zoom Construction Supplies Platform
        </p>
        <div>
          <h1 class="text-2xl font-semibold md:text-3xl">
            Admin Command Center
          </h1>
          <p class="mt-2 max-w-2xl text-sm text-slate-600 md:text-base">
            Track revenue, fulfillment, and inventory pressure across every
            active construction site.
          </p>
        </div>
        <div class="flex flex-wrap items-center gap-3 text-xs text-slate-500">
          <span class="rounded-full bg-white/70 px-3 py-1 shadow-sm">
            Range: {{ rangeLabel }}
          </span>
          <span>Updated {{ updatedAt }}</span>
        </div>
      </div>

      <div class="flex flex-wrap items-center gap-3">
        <UButton color="neutral" variant="outline" icon="i-lucide-download">
          Export Snapshot
        </UButton>
        <UButton color="primary" icon="i-lucide-plus"> New Order </UButton>
      </div>
    </div>
  </section>
</template>
