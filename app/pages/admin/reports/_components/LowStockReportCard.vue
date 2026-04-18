<script setup lang="ts">
import type { AdminLowStockReportRow } from "~/utils/admin-reports";
import { formatNumber, formatStatusLabel } from "~/utils/format";

const props = defineProps<{
  rows: AdminLowStockReportRow[];
}>();
</script>

<template>
  <UCard>
    <div v-if="props.rows.length" class="space-y-3">
      <div
        v-for="row in props.rows"
        :key="row.product.id"
        class="flex flex-col gap-3 border-b border-default pb-3 last:border-b-0 last:pb-0 md:flex-row md:items-center md:justify-between"
      >
        <div>
          <p class="font-medium text-slate-900">
            {{ row.product.name ?? "Unnamed product" }}
          </p>
          <p class="text-sm text-slate-500">
            {{ row.product.sku ?? "No SKU" }}
          </p>
        </div>
        <div class="flex flex-wrap items-center gap-2">
          <UBadge :color="row.state === 'out' ? 'error' : 'warning'" variant="subtle">
            {{ formatStatusLabel(row.state) }}
          </UBadge>
          <span class="text-sm text-slate-600">
            {{ formatNumber(row.currentStock) }} on hand / min
            {{ formatNumber(row.minimumStock) }}
          </span>
        </div>
      </div>
    </div>
    <p v-else class="text-sm text-slate-600">
      No low-stock products match the current filters.
    </p>
  </UCard>
</template>
