<script setup lang="ts">
import type { AdminCustomerReportRow } from "~/utils/admin-reports";
import { formatCurrency, formatNumber } from "~/utils/format";

const props = defineProps<{
  rows: AdminCustomerReportRow[];
}>();
</script>

<template>
  <UCard>
    <div v-if="props.rows.length" class="space-y-3">
      <div
        v-for="row in props.rows"
        :key="row.id"
        class="grid gap-3 border-b border-default pb-3 last:border-b-0 last:pb-0 md:grid-cols-[1fr_auto_auto]"
      >
        <div>
          <p class="font-medium text-slate-900">
            {{ row.name }}
          </p>
          <p class="text-sm text-slate-500">
            {{ row.contact }}
          </p>
        </div>
        <p class="text-sm text-slate-600">
          {{ formatNumber(row.orders) }} orders
        </p>
        <p class="font-semibold">
          {{ formatCurrency(row.revenue) }}
        </p>
      </div>
    </div>
    <p v-else class="text-sm text-slate-600">
      Customer order history will appear once orders match the current filters.
    </p>
  </UCard>
</template>
