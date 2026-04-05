<script setup lang="ts">
import type { Customer } from "~/types/customer";
import { formatLongDate } from "~/utils/format";

const props = defineProps<{
  customer: Customer;
}>();

const rows = computed(() => [
  {
    label: "Account status",
    value: props.customer.user_id ? "Linked account" : "Unlinked customer",
    badge: true,
    color: props.customer.user_id ? "success" : "neutral",
  },
  {
    label: "User ID",
    value: props.customer.user_id || "No linked user record",
    badge: false,
    color: "neutral",
  },
  {
    label: "Created",
    value: formatLongDate(props.customer.created_at),
    badge: false,
    color: "neutral",
  },
  {
    label: "Updated",
    value: formatLongDate(props.customer.updated_at),
    badge: false,
    color: "neutral",
  },
]);
</script>

<template>
  <UCard>
    <p class="text-xs uppercase tracking-[0.18em] text-slate-500">
      Account Overview
    </p>
    <h2 class="mt-2 text-xl font-semibold text-slate-900">
      Customer Profile Status
    </h2>
    <p class="mt-3 text-sm leading-6 text-slate-700">
      This section reflects the current account linkage and lifecycle metadata
      available from the customer record.
    </p>

    <div class="mt-6 space-y-4">
      <div
        v-for="row in rows"
        :key="row.label"
        class="flex items-start justify-between gap-4"
      >
        <span class="text-sm text-slate-500">{{ row.label }}</span>
        <UBadge
          v-if="row.badge"
          :color="row.color"
          variant="subtle"
        >
          {{ row.value }}
        </UBadge>
        <span v-else class="text-right font-medium text-slate-800">
          {{ row.value }}
        </span>
      </div>
    </div>
  </UCard>
</template>
