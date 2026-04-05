<script setup lang="ts">
import { formatNumber } from "~/utils/format";

const props = defineProps<{
  total: number;
  pendingCount: number;
  approvedCount: number;
  completedCount: number;
}>();

const orderLabel = computed(() => {
  if (!props.total) {
    return "Track your submitted orders here once they become available.";
  }

  return `${props.total} order${props.total === 1 ? "" : "s"} available for review`;
});
</script>

<template>
  <StorefrontSectionCard padding="lg">
    <div class="flex flex-col gap-6">
      <div class="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <p class="text-[0.72rem] font-semibold uppercase tracking-[0.22em] text-amber-700">
            Buyer orders
          </p>
          <h1 class="mt-3 text-4xl font-bold tracking-[-0.05em] text-slate-950">
            My orders
          </h1>
          <p class="mt-3 text-sm leading-7 text-slate-600">
            {{ orderLabel }}
          </p>
        </div>

        <div class="flex flex-wrap items-center gap-3">
          <StorefrontButton tone="secondary" to="/shop">
            Continue shopping
          </StorefrontButton>
        </div>
      </div>

      <div class="grid gap-4 sm:grid-cols-3">
        <div class="rounded-xl border border-slate-200 bg-slate-50 p-4">
          <p class="text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-slate-500">
            Total orders
          </p>
          <p class="mt-2 text-2xl font-bold tracking-tight text-slate-950">
            {{ formatNumber(props.total) }}
          </p>
        </div>
        <div class="rounded-xl border border-slate-200 bg-slate-50 p-4">
          <p class="text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-slate-500">
            Pending now
          </p>
          <p class="mt-2 text-2xl font-bold tracking-tight text-slate-950">
            {{ formatNumber(props.pendingCount) }}
          </p>
        </div>
        <div class="rounded-xl border border-slate-200 bg-slate-50 p-4">
          <p class="text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-slate-500">
            Approved / completed
          </p>
          <p class="mt-2 text-2xl font-bold tracking-tight text-slate-950">
            {{ formatNumber(props.approvedCount + props.completedCount) }}
          </p>
        </div>
      </div>
    </div>
  </StorefrontSectionCard>
</template>
