<script setup lang="ts">
import type {
  StaffDelivery,
  StaffDeliverySummary,
} from "./staff-dashboard.types";

defineProps<{
  deliveries: StaffDelivery[];
  summary: StaffDeliverySummary[];
}>();
</script>

<template>
  <UCard class="h-full">
    <div class="flex flex-wrap items-start justify-between gap-4">
      <div>
        <p class="text-xs uppercase tracking-[0.18em] text-slate-500">
          Delivery Follow-up
        </p>
        <p class="mt-1 text-lg font-semibold">Dispatch status preview</p>
      </div>
      <UButton
        color="neutral"
        variant="outline"
        icon="i-lucide-truck"
        to="/staff/deliveries"
      >
        Monitor deliveries
      </UButton>
    </div>

    <div class="mt-5 grid gap-3 sm:grid-cols-3">
      <div
        v-for="item in summary"
        :key="item.id"
        class="rounded-2xl border border-slate-200/70 bg-slate-50 p-4"
      >
        <div class="flex items-center gap-3">
          <div
            class="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-slate-700 shadow-sm"
          >
            <UIcon :name="item.icon" class="h-5 w-5" />
          </div>
          <div>
            <p class="text-xs uppercase tracking-[0.14em] text-slate-500">
              {{ item.label }}
            </p>
            <p class="text-lg font-semibold text-slate-900">
              {{ item.value }}
            </p>
          </div>
        </div>
        <UBadge class="mt-3" :color="item.tone" variant="subtle">
          Active queue
        </UBadge>
      </div>
    </div>

    <div class="mt-5 space-y-3">
      <div
        v-for="delivery in deliveries"
        :key="delivery.id"
        class="rounded-2xl border border-slate-200/70 bg-slate-50 p-4"
      >
        <div class="flex flex-wrap items-start justify-between gap-3">
          <div>
            <div class="flex flex-wrap items-center gap-2">
              <p class="text-sm font-semibold text-slate-900">
                {{ delivery.id }}
              </p>
              <span class="text-sm text-slate-500">
                {{ delivery.orderId }}
              </span>
            </div>
            <p class="mt-2 text-sm text-slate-600">
              {{ delivery.loadSummary }}
            </p>
          </div>
          <UBadge :color="delivery.statusTone" variant="subtle">
            {{ delivery.status }}
          </UBadge>
        </div>

        <div class="mt-3 grid gap-2 text-sm text-slate-600 sm:grid-cols-2">
          <p>Destination: {{ delivery.destination }}</p>
          <p>Driver: {{ delivery.driver }}</p>
          <p class="sm:col-span-2">Update: {{ delivery.eta }}</p>
        </div>
      </div>
    </div>
  </UCard>
</template>
