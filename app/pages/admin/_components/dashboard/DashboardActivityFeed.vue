<script setup lang="ts">
import type { DashboardActivity } from "~/types/dashboard";
import { formatShortDateOrFallback } from "~/utils/format";

const props = defineProps<{
  entries: DashboardActivity[];
}>();
</script>

<template>
  <aside class="rounded-sm bg-white p-5 shadow-sm dark:bg-gray-900">
    <div class="flex items-center justify-between gap-3">
      <h2 class="text-xl font-semibold tracking-tight text-slate-900">
        Activity Feed
      </h2>
      <UBadge color="warning" variant="subtle">
        Live context
      </UBadge>
    </div>

    <div v-if="props.entries.length" class="mt-5 space-y-3">
      <article
        v-for="entry in props.entries"
        :key="entry.id"
        class="flex items-start gap-3 rounded-sm bg-white p-3 dark:bg-gray-900"
      >
        <div class="mt-0.5 flex h-8 w-8 items-center justify-center rounded-lg bg-slate-900 text-white">
          <UIcon :name="entry.icon" />
        </div>
        <div class="min-w-0">
          <p class="font-medium text-slate-900">
            {{ entry.label }}
          </p>
          <p class="text-sm text-slate-600">
            {{ entry.detail }}
          </p>
          <p class="mt-1 text-xs text-slate-500">
            {{ formatShortDateOrFallback(entry.date) }}
          </p>
        </div>
      </article>
    </div>
    <p v-else class="mt-5 text-sm text-slate-600">
      Recent activity will appear here as orders, payments, and customers are updated.
    </p>
  </aside>
</template>
