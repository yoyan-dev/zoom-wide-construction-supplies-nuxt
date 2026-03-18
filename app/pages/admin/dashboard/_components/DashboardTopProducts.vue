<script setup lang="ts">
import type { DashboardTopProductRow } from "~/types/dashboard";
import { formatCurrency, formatNumber } from "~/utils/format";

const props = defineProps<{
  rows: DashboardTopProductRow[];
}>();

const maxUnits = computed(() =>
  props.rows.length ? Math.max(...props.rows.map((row) => row.units_sold)) : 1,
);
</script>

<template>
  <UCard>
    <div class="mb-4 flex items-center justify-between">
      <div>
        <p class="text-xs uppercase tracking-[0.18em] text-slate-500">
          Top Sellers
        </p>
        <p class="mt-1 text-lg font-semibold">Products driving volume</p>
      </div>
      <UButton color="neutral" variant="ghost" icon="i-lucide-package">
        Catalog
      </UButton>
    </div>

    <div class="space-y-4">
      <div v-for="row in props.rows" :key="row.product.id" class="space-y-2">
        <div class="flex items-center justify-between text-sm">
          <div>
            <p class="font-medium">{{ row.product.name }}</p>
            <p class="text-xs text-slate-500">
              {{ formatNumber(row.units_sold) }} units ·
              {{ formatCurrency(row.revenue) }}
            </p>
          </div>
          <UBadge color="primary" variant="subtle">{{
            row.product.unit
          }}</UBadge>
        </div>
        <UProgress
          :value="(row.units_sold / maxUnits) * 100"
          color="primary"
          size="sm"
        />
      </div>
    </div>
  </UCard>
</template>
