<script setup lang="ts">
import type { DashboardRevenuePoint } from "~/types/dashboard";
import { formatCurrency, formatShortDate } from "~/utils/format";

const props = defineProps<{
  series: DashboardRevenuePoint[];
}>();

const values = computed(() => props.series.map((point) => point.revenue));
const minValue = computed(() =>
  values.value.length ? Math.min(...values.value) : 0,
);
const maxValue = computed(() =>
  values.value.length ? Math.max(...values.value) : 0,
);
const spread = computed(() => maxValue.value - minValue.value || 1);

const totalRevenue = computed(() =>
  props.series.reduce((sum, point) => sum + point.revenue, 0),
);

const chartPath = computed(() => {
  if (props.series.length === 0) return "";
  return props.series
    .map((point, index) => {
      const x = (index / (props.series.length - 1)) * 100;
      const normalized = (point.revenue - minValue.value) / spread.value;
      const y = 36 - normalized * 26;
      return `${index === 0 ? "M" : "L"} ${x.toFixed(2)} ${y.toFixed(2)}`;
    })
    .join(" ");
});

const areaPath = computed(() => {
  if (!chartPath.value) return "";
  return `${chartPath.value} L 100 40 L 0 40 Z`;
});

const firstLabel = computed(() =>
  props.series[0] ? formatShortDate(props.series[0].date) : "",
);

const lastLabel = computed(() => {
  const last = props.series[props.series.length - 1];
  return last ? formatShortDate(last.date) : "";
});

const pointY = (value: number) => {
  const normalized = (value - minValue.value) / spread.value;
  return 36 - normalized * 26;
};
</script>

<template>
  <UCard>
    <div class="flex items-start justify-between gap-4">
      <div>
        <p class="text-xs uppercase tracking-[0.18em] text-slate-500">
          Revenue Flow
        </p>
        <p class="mt-2 text-2xl font-semibold">
          {{ formatCurrency(totalRevenue) }}
        </p>
        <p class="mt-1 text-sm text-slate-500">14-day trendline</p>
      </div>
      <div
        class="rounded-full bg-emerald-50 px-3 py-1 text-xs text-emerald-700"
      >
        +12.4% momentum
      </div>
    </div>

    <div class="mt-6">
      <svg viewBox="0 0 100 40" class="h-28 w-full">
        <defs>
          <linearGradient id="revenue-fill" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stop-color="#34d399" stop-opacity="0.35" />
            <stop offset="100%" stop-color="#34d399" stop-opacity="0" />
          </linearGradient>
        </defs>
        <path
          v-if="areaPath"
          :d="areaPath"
          fill="url(#revenue-fill)"
          stroke="none"
        />
        <path
          v-if="chartPath"
          :d="chartPath"
          fill="none"
          stroke="#0f172a"
          stroke-width="1.6"
        />
        <circle
          v-for="(point, index) in props.series"
          :key="point.date"
          :cx="(index / (props.series.length - 1)) * 100"
          :cy="pointY(point.revenue)"
          r="1.4"
          fill="#0f172a"
        />
      </svg>
      <div class="flex items-center justify-between text-xs text-slate-500">
        <span>{{ firstLabel }}</span>
        <span>{{ lastLabel }}</span>
      </div>
    </div>
  </UCard>
</template>
