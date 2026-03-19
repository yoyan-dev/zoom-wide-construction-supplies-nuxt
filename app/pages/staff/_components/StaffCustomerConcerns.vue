<script setup lang="ts">
import type { StaffCustomerConcern } from "./staff-dashboard.types";

defineProps<{
  concerns: StaffCustomerConcern[];
}>();
</script>

<template>
  <UCard>
    <div class="flex flex-wrap items-start justify-between gap-4">
      <div>
        <p class="text-xs uppercase tracking-[0.18em] text-slate-500">
          Customer Concerns
        </p>
        <p class="mt-1 text-lg font-semibold">Inquiry and follow-up queue</p>
      </div>
      <UButton
        color="neutral"
        variant="outline"
        icon="i-lucide-users"
        to="/staff/customers"
      >
        Check customers
      </UButton>
    </div>

    <div class="mt-5 space-y-3">
      <div
        v-for="concern in concerns"
        :key="concern.id"
        class="rounded-2xl border border-slate-200/70 bg-slate-50 p-4"
      >
        <div class="flex flex-wrap items-start justify-between gap-3">
          <div>
            <div class="flex flex-wrap items-center gap-2">
              <p class="text-sm font-semibold text-slate-900">
                {{ concern.customer }}
              </p>
              <UBadge color="neutral" variant="subtle">
                {{ concern.channel }}
              </UBadge>
              <UBadge :color="concern.priorityTone" variant="subtle">
                {{ concern.priority }}
              </UBadge>
            </div>
            <p class="mt-2 text-sm text-slate-600">
              {{ concern.topic }}
            </p>
          </div>

          <UButton
            color="neutral"
            variant="ghost"
            size="sm"
            icon="i-lucide-arrow-right"
            :to="concern.to"
          >
            Open
          </UButton>
        </div>

        <div class="mt-3 space-y-1 text-sm text-slate-600">
          <p>{{ concern.requestedAction }}</p>
          <p class="text-xs uppercase tracking-[0.14em] text-slate-500">
            {{ concern.waitTime }}
          </p>
        </div>
      </div>
    </div>
  </UCard>
</template>
