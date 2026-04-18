<script setup lang="ts">
import type { DashboardTopProductRow } from "~/types/dashboard";
import { formatCurrency } from "~/utils/format";

const props = defineProps<{
  rows: DashboardTopProductRow[];
}>();
</script>

<template>
  <article class="rounded-sm bg-white p-5 shadow-sm dark:bg-gray-900">
    <div class="flex items-center justify-between gap-3">
      <h2 class="text-xl font-semibold tracking-tight text-slate-900">
        Top Products
      </h2>
      <UBadge color="neutral" variant="subtle">
        {{ props.rows.length }} signals
      </UBadge>
    </div>

    <div v-if="props.rows.length" class="mt-5 space-y-3">
      <div
        v-for="row in props.rows"
        :key="row.product.id ?? row.product.name"
        class="flex items-center justify-between gap-4 rounded-sm border border-slate-200/70 bg-white p-3 dark:bg-gray-900"
      >
        <div class="min-w-0">
          <p class="truncate font-medium text-slate-900">
            {{ row.product.name ?? "Unnamed product" }}
          </p>
          <p class="text-xs text-slate-500">
            {{ row.units_sold }} units sold
          </p>
        </div>
        <span class="shrink-0 text-sm font-semibold text-slate-900">
          {{ formatCurrency(row.revenue) }}
        </span>
      </div>
    </div>
    <p v-else class="mt-5 text-sm text-slate-600">
      Product insights will appear once sales activity is available.
    </p>
  </article>
</template>
