<script setup lang="ts">
import type { StaffQuickAction } from "./staff-dashboard.types";

defineProps<{
  actions: StaffQuickAction[];
}>();
</script>

<template>
  <UCard>
    <div class="flex flex-wrap items-start justify-between gap-4">
      <div>
        <p class="text-xs uppercase tracking-[0.18em] text-slate-500">
          Quick Actions
        </p>
        <p class="mt-1 text-lg font-semibold">Jump into the next task</p>
      </div>
      <p class="max-w-xl text-sm text-slate-600">
        Shortcuts are aligned with the staff modules already available in the
        system, so daily follow-up work stays one click away.
      </p>
    </div>

    <div class="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      <div
        v-for="action in actions"
        :key="action.id"
        class="rounded-2xl border border-slate-200/70 bg-slate-50 p-4"
      >
        <div class="flex items-start justify-between gap-3">
          <div
            class="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-slate-700 shadow-sm"
          >
            <UIcon :name="action.icon" class="h-5 w-5" />
          </div>
          <UBadge :color="action.tone" variant="subtle">
            {{ action.count }}
          </UBadge>
        </div>

        <div class="mt-4">
          <p class="text-sm font-semibold text-slate-900">
            {{ action.label }}
          </p>
          <p class="mt-2 text-sm leading-6 text-slate-600">
            {{ action.description }}
          </p>
        </div>

        <UButton
          class="mt-4"
          block
          :color="action.tone"
          variant="soft"
          :to="action.to"
        >
          Open workspace
        </UButton>
      </div>
    </div>
  </UCard>
</template>
