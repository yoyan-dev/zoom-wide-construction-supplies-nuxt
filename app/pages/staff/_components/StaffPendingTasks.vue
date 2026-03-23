<script setup lang="ts">
import type { StaffTask } from "./staff-dashboard.types";

defineProps<{
  tasks: StaffTask[];
}>();
</script>

<template>
  <section id="pending-tasks">
    <UCard class="h-full">
      <div class="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p class="text-xs uppercase tracking-[0.18em] text-slate-500">
            Pending Tasks
          </p>
          <p class="mt-1 text-lg font-semibold">Operational checklist</p>
        </div>
        <UBadge color="warning" variant="subtle"> 4 due this morning </UBadge>
      </div>

      <div class="mt-5 space-y-3">
        <div
          v-for="task in tasks"
          :key="task.id"
          class="rounded-2xl border border-slate-200/70 bg-slate-50 p-4"
        >
          <div class="flex flex-wrap items-start justify-between gap-3">
            <div>
              <div class="flex flex-wrap items-center gap-2">
                <p class="text-sm font-semibold text-slate-900">
                  {{ task.title }}
                </p>
                <UBadge :color="task.priorityTone" variant="subtle">
                  {{ task.priority }}
                </UBadge>
              </div>
              <p class="mt-2 text-sm leading-6 text-slate-600">
                {{ task.detail }}
              </p>
            </div>

            <UButton
              color="neutral"
              variant="ghost"
              size="sm"
              icon="i-lucide-arrow-right"
              :to="task.to"
            >
              Open
            </UButton>
          </div>

          <div class="mt-3 flex flex-wrap gap-2 text-xs text-slate-500">
            <span class="rounded-full bg-white px-3 py-1 shadow-sm">
              {{ task.due }}
            </span>
            <span class="rounded-full bg-white px-3 py-1 shadow-sm">
              Owner: {{ task.owner }}
            </span>
          </div>
        </div>
      </div>
    </UCard>
  </section>
</template>
