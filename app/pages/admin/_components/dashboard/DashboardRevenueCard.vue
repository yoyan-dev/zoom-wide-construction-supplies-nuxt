<script setup lang="ts">
import { formatCurrency } from "~/utils/format";

interface Row {
  label: string;
  total: number;
  widthClass: string;
}

const props = defineProps<{
  rangeLabel: string;
  rows: Row[];
}>();
</script>

<template>
  <article class="rounded-sm bg-white p-5 shadow-sm dark:bg-gray-900">
    <div class="flex items-center justify-between gap-3">
      <h2 class="text-xl font-semibold tracking-tight text-slate-900">
        Revenue Snapshots
      </h2>
      <UBadge color="neutral" variant="subtle">
        {{ props.rangeLabel }}
      </UBadge>
    </div>

    <div v-if="props.rows.length" class="mt-5 space-y-3">
      <div v-for="row in props.rows" :key="row.label" class="space-y-2">
        <div class="flex items-center justify-between text-sm text-slate-600">
          <span>{{ row.label }}</span>
          <span class="font-semibold text-slate-900">
            {{ formatCurrency(row.total) }}
          </span>
        </div>
        <div class="h-2 rounded-full bg-slate-100">
          <div :class="['h-full rounded-full bg-amber-500', row.widthClass]" />
        </div>
      </div>
    </div>
    <p v-else class="mt-5 text-sm text-slate-600">
      Revenue totals will appear here once summary records are available.
    </p>
  </article>
</template>
