<script setup lang="ts">
import type { AdminReportStatusRow } from "~/utils/admin-reports";
import { formatCurrency, formatNumber } from "~/utils/format";

const props = defineProps<{
  rows: AdminReportStatusRow[];
}>();
</script>

<template>
  <UCard>
    <div class="space-y-3">
      <div
        v-for="row in props.rows"
        :key="row.label"
        class="flex items-center justify-between gap-4 border-b border-default pb-3 last:border-b-0 last:pb-0"
      >
        <div>
          <p class="font-medium text-slate-900">
            {{ row.label }}
          </p>
          <p class="text-sm text-slate-500">
            {{ formatNumber(row.count) }} records
          </p>
        </div>
        <p class="font-semibold">
          {{ formatCurrency(row.amount ?? 0) }}
        </p>
      </div>
    </div>
  </UCard>
</template>
