<script setup lang="ts">
const settings = [
  {
    label: "Business name",
    value: "ZOOM WIDE Construction Supplies",
  },
  {
    label: "Operational currency",
    value: "PHP",
  },
  {
    label: "Default stock signal",
    value: "Product minimum stock quantity",
  },
  {
    label: "Fulfillment flow",
    value: "Order approval, delivery assignment, payment tracking",
  },
];
</script>

<template>
  <UCard>
    <div class="space-y-4">
      <div>
        <p class="text-xs uppercase tracking-[0.18em] text-slate-500">
          System Defaults
        </p>
        <p class="mt-1 text-lg font-semibold text-slate-900">
          Business settings
        </p>
        <p class="mt-2 text-sm leading-6 text-slate-600">
          These operational defaults are currently documented as display-only
          values because no business-settings endpoint is available in the
          frontend API contract.
        </p>
      </div>

      <div class="space-y-3">
        <div
          v-for="setting in settings"
          :key="setting.label"
          class="rounded-sm border border-slate-200/70 bg-white p-4 dark:bg-gray-900"
        >
          <p class="text-xs uppercase tracking-[0.18em] text-slate-500">
            {{ setting.label }}
          </p>
          <p class="mt-2 font-medium text-slate-900">
            {{ setting.value }}
          </p>
        </div>
      </div>
    </div>
  </UCard>
</template>
