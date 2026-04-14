<script setup lang="ts">
import type { AdminReportStatusRow } from "~/utils/admin-reports";
import { formatCurrency, formatNumber } from "~/utils/format";

const props = defineProps<{
  rows: AdminReportStatusRow[];
  columnsClass?: string;
  amountFormat?: "currency" | "number";
  amountSuffix?: string;
}>();

const formatAmount = (value = 0) =>
  props.amountFormat === "currency"
    ? formatCurrency(value)
    : `${formatNumber(value)}${props.amountSuffix ? ` ${props.amountSuffix}` : ""}`;
</script>

<template>
  <UCard>
    <div :class="['grid gap-3', props.columnsClass ?? 'md:grid-cols-2 xl:grid-cols-5']">
      <div
        v-for="row in props.rows"
        :key="row.label"
        class="rounded-sm border border-default p-4"
      >
        <p class="text-sm font-medium text-slate-900">
          {{ row.label }}
        </p>
        <p class="mt-2 text-2xl font-semibold">
          {{ formatNumber(row.count) }}
        </p>
        <p v-if="row.amount !== undefined" class="mt-1 text-sm text-slate-600">
          {{ formatAmount(row.amount) }}
        </p>
      </div>
    </div>
  </UCard>
</template>
