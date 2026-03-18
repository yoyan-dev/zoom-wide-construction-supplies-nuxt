<script setup lang="ts">
import type { DashboardLowStockRow } from "~/types/dashboard";
import { formatNumber } from "~/utils/format";

const props = defineProps<{
  rows: DashboardLowStockRow[];
}>();
</script>

<template>
  <UCard class="border border-rose-200/60 bg-rose-50/40">
    <div class="mb-4 flex items-center justify-between">
      <div>
        <p class="text-xs uppercase tracking-[0.18em] text-rose-600">
          Low Stock Alerts
        </p>
        <p class="mt-1 text-lg font-semibold">Immediate replenishment</p>
      </div>
      <UButton color="error" variant="ghost" icon="i-lucide-alert-circle">
        Restock
      </UButton>
    </div>

    <div class="space-y-3">
      <div
        v-for="row in props.rows"
        :key="row.product.id"
        class="flex items-center justify-between rounded-2xl border border-rose-200/60 px-4 py-3"
      >
        <div>
          <p class="font-medium">{{ row.product.name }}</p>
          <p class="text-xs text-slate-500">
            {{ formatNumber(row.product.stock_quantity) }} on hand · Minimum
            {{ formatNumber(row.product.minimum_stock_quantity) }}
          </p>
        </div>
        <UBadge color="error" variant="solid">
          -{{ formatNumber(row.short_by) }} {{ row.product.unit }}
        </UBadge>
      </div>
    </div>
  </UCard>
</template>
