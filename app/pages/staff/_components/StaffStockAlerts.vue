<script setup lang="ts">
import type { StaffStockAlert } from "./staff-dashboard.types";

defineProps<{
  alerts: StaffStockAlert[];
}>();
</script>

<template>
  <UCard>
    <div class="flex flex-wrap items-start justify-between gap-4">
      <div>
        <p class="text-xs uppercase tracking-[0.18em] text-slate-500">
          Stock Alerts
        </p>
        <p class="mt-1 text-lg font-semibold">Product availability watch</p>
      </div>
      <UButton
        color="neutral"
        variant="outline"
        icon="i-lucide-package"
        to="/staff/products"
      >
        Check products
      </UButton>
    </div>

    <div class="mt-5 space-y-3">
      <div
        v-for="alert in alerts"
        :key="alert.id"
        class="rounded-2xl border border-slate-200/70 bg-slate-50 p-4"
      >
        <div class="flex items-start justify-between gap-3">
          <div>
            <div class="flex flex-wrap items-center gap-2">
              <p class="text-sm font-semibold text-slate-900">
                {{ alert.name }}
              </p>
              <UBadge :color="alert.levelTone" variant="subtle">
                {{ alert.level }}
              </UBadge>
            </div>
            <p class="mt-1 text-xs uppercase tracking-[0.14em] text-slate-500">
              {{ alert.sku }}
            </p>
          </div>
          <p class="text-sm font-semibold text-slate-900">
            {{ alert.remaining }}
          </p>
        </div>

        <div class="mt-3 space-y-1 text-sm text-slate-600">
          <p>{{ alert.location }}</p>
          <p>{{ alert.restockNote }}</p>
        </div>
      </div>
    </div>
  </UCard>
</template>
