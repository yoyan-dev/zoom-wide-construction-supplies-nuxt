<script setup lang="ts">
import type { DashboardKpi } from "~/types/dashboard";
import { formatCurrency, formatNumber } from "~/utils/format";

const props = defineProps<{
  kpis: DashboardKpi[];
}>();

const iconMap: Record<DashboardKpi["id"], string> = {
  revenue: "i-lucide-trending-up",
  orders_today: "i-lucide-shopping-cart",
  pending_deliveries: "i-lucide-truck",
  low_stock: "i-lucide-alert-triangle",
};

const toneClasses: Record<DashboardKpi["trend"], string> = {
  up: "text-emerald-600 bg-emerald-50",
  down: "text-rose-600 bg-rose-50",
  flat: "text-slate-600 bg-slate-100",
};

const formattedValue = (kpi: DashboardKpi) =>
  kpi.unit === "currency" ? formatCurrency(kpi.value) : formatNumber(kpi.value);
</script>

<template>
  <section class="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
    <UCard v-for="kpi in props.kpis" :key="kpi.id">
      <div class="flex items-center justify-between">
        <div>
          <p class="text-xs uppercase tracking-[0.18em] text-slate-500">
            {{ kpi.label }}
          </p>
          <p class="mt-2 text-2xl font-semibold">
            {{ formattedValue(kpi) }}
          </p>
        </div>
        <div
          class="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-100 text-slate-700"
        >
          <UIcon :name="iconMap[kpi.id]" class="h-5 w-5" />
        </div>
      </div>

      <div class="mt-4 flex items-center gap-2 text-xs text-slate-500">
        <span
          class="rounded-full px-2 py-1 font-medium"
          :class="toneClasses[kpi.trend]"
        >
          {{ kpi.delta > 0 ? "+" : "" }}{{ kpi.delta }}%
        </span>
        <span>vs previous period</span>
      </div>
    </UCard>
  </section>
</template>
