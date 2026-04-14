<script setup lang="ts">
import { formatStatusLabel } from "~/utils/format";

const props = defineProps<{
  sections: Array<{
    label: string;
    rows: Array<{
      status: string;
      count: number;
    }>;
  }>;
}>();
</script>

<template>
  <div class="grid gap-4 md:grid-cols-3">
    <article
      v-for="section in props.sections"
      :key="section.label"
      class="rounded-sm bg-white p-5 shadow-sm dark:bg-gray-900"
    >
      <p class="text-xs uppercase tracking-[0.16em] text-slate-500">
        {{ section.label }}
      </p>
      <div class="mt-3 space-y-2">
        <div
          v-for="row in section.rows"
          :key="`${section.label}-${row.status}`"
          class="flex items-center justify-between text-sm"
        >
          <span class="text-slate-600">
            {{ formatStatusLabel(row.status) }}
          </span>
          <span class="font-semibold text-slate-900">
            {{ row.count }}
          </span>
        </div>
      </div>
    </article>
  </div>
</template>
