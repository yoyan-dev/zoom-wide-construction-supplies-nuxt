<script setup lang="ts">
import type { Order } from "~/types/order";
import { formatCurrency, formatLongDate } from "~/utils/format";

type BadgeColor =
  | "primary"
  | "secondary"
  | "success"
  | "info"
  | "warning"
  | "error"
  | "neutral";

const props = defineProps<{
  order: Order;
}>();

const statusBadge = computed<{ color: BadgeColor; label: string }>(() => {
  switch (props.order.status) {
    case "approved":
      return { color: "success", label: "Approved" };
    case "rejected":
      return { color: "error", label: "Rejected" };
    case "cancelled":
      return { color: "neutral", label: "Cancelled" };
    case "completed":
      return { color: "info", label: "Completed" };
    default:
      return { color: "warning", label: "Pending" };
    }
});
</script>

<template>
  <UCard>
    <div class="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
      <div class="min-w-0">
        <div class="flex flex-wrap items-center gap-3">
          <p class="text-lg font-semibold text-slate-900">
            Order {{ props.order.id }}
          </p>
          <UBadge :color="statusBadge.color" variant="subtle">
            {{ statusBadge.label }}
          </UBadge>
        </div>

        <p class="mt-2 text-sm text-slate-600">
          Submitted {{ formatLongDate(props.order.created_at) }}
        </p>

        <div class="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <p class="text-xs uppercase tracking-[0.18em] text-slate-500">
              Total
            </p>
            <p class="mt-2 font-semibold text-slate-900">
              {{ formatCurrency(props.order.total_amount ?? 0) }}
            </p>
          </div>

          <div>
            <p class="text-xs uppercase tracking-[0.18em] text-slate-500">
              Last Updated
            </p>
            <p class="mt-2 font-medium text-slate-900">
              {{ formatLongDate(props.order.updated_at) }}
            </p>
          </div>
        </div>

        <p v-if="props.order.notes" class="mt-4 line-clamp-2 text-sm leading-6 text-slate-600">
          {{ props.order.notes }}
        </p>
      </div>

      <div class="flex shrink-0 flex-col gap-3 lg:items-end">
        <UButton color="primary" :to="`/orders/${props.order.id}`">
          View Tracking
        </UButton>
      </div>
    </div>
  </UCard>
</template>
