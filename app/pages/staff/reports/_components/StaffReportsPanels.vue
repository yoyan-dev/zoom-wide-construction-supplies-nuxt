<script setup lang="ts">
type SummaryItem = {
  label: string;
  value: number;
  tone: "primary" | "secondary" | "success" | "info" | "warning" | "error" | "neutral";
};

type StockRisk = {
  id: string;
  name: string;
  stock: number;
  minimum: number;
  unit: string;
};

type CustomerCoverage = {
  id: string;
  company: string;
  orders: number;
};

defineProps<{
  orderSummary: SummaryItem[];
  deliverySummary: SummaryItem[];
  stockRisks: StockRisk[];
  customerCoverage: CustomerCoverage[];
}>();
</script>

<template>
  <div class="grid gap-6 xl:grid-cols-2">
    <UCard>
      <div class="mb-4">
        <p class="text-xs uppercase tracking-[0.18em] text-slate-500">
          Order Status Report
        </p>
        <p class="mt-1 text-lg font-semibold">Current order mix</p>
      </div>
      <div class="space-y-3">
        <div
          v-for="item in orderSummary"
          :key="item.label"
          class="flex items-center justify-between rounded-2xl border border-slate-200/70 bg-slate-50 px-4 py-3"
        >
          <span class="text-sm text-slate-700">{{ item.label }}</span>
          <UBadge :color="item.tone" variant="subtle">{{ item.value }}</UBadge>
        </div>
      </div>
    </UCard>

    <UCard>
      <div class="mb-4">
        <p class="text-xs uppercase tracking-[0.18em] text-slate-500">
          Delivery Report
        </p>
        <p class="mt-1 text-lg font-semibold">Dispatch status summary</p>
      </div>
      <div class="space-y-3">
        <div
          v-for="item in deliverySummary"
          :key="item.label"
          class="flex items-center justify-between rounded-2xl border border-slate-200/70 bg-slate-50 px-4 py-3"
        >
          <span class="text-sm text-slate-700">{{ item.label }}</span>
          <UBadge :color="item.tone" variant="subtle">{{ item.value }}</UBadge>
        </div>
      </div>
    </UCard>

    <UCard>
      <div class="mb-4">
        <p class="text-xs uppercase tracking-[0.18em] text-slate-500">
          Stock Pressure
        </p>
        <p class="mt-1 text-lg font-semibold">Products needing attention</p>
      </div>
      <div class="space-y-3">
        <div
          v-for="item in stockRisks"
          :key="item.id"
          class="rounded-2xl border border-slate-200/70 bg-slate-50 px-4 py-3"
        >
          <div class="flex items-center justify-between gap-3">
            <span class="font-medium text-slate-900">{{ item.name }}</span>
            <UBadge color="warning" variant="subtle">
              {{ item.stock }} / {{ item.minimum }} {{ item.unit }}
            </UBadge>
          </div>
        </div>
      </div>
    </UCard>

    <UCard>
      <div class="mb-4">
        <p class="text-xs uppercase tracking-[0.18em] text-slate-500">
          Customer Coverage
        </p>
        <p class="mt-1 text-lg font-semibold">Top accounts by order volume</p>
      </div>
      <div class="space-y-3">
        <div
          v-for="item in customerCoverage"
          :key="item.id"
          class="flex items-center justify-between rounded-2xl border border-slate-200/70 bg-slate-50 px-4 py-3"
        >
          <span class="text-sm text-slate-700">{{ item.company }}</span>
          <UBadge color="info" variant="subtle">{{ item.orders }} orders</UBadge>
        </div>
      </div>
    </UCard>
  </div>
</template>
