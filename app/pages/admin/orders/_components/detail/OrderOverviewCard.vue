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
  lineItemCount: number;
  totalUnits: number;
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
    <div class="flex items-start justify-between gap-4">
      <div>
        <p class="text-xs uppercase tracking-[0.18em] text-slate-500">
          Order Identity
        </p>
        <p class="mt-2 text-2xl font-semibold text-slate-900">
          {{ props.order.id }}
        </p>
      </div>

      <UBadge :color="statusBadge.color" variant="subtle">
        {{ statusBadge.label }}
      </UBadge>
    </div>

    <div class="mt-6 grid gap-4 md:grid-cols-3">
      <div>
        <p class="text-xs uppercase tracking-[0.18em] text-slate-500">
          Total Amount
        </p>
        <p class="mt-2 text-lg font-semibold text-slate-800">
          {{ formatCurrency(props.order.total_amount ?? 0) }}
        </p>
      </div>
      <div>
        <p class="text-xs uppercase tracking-[0.18em] text-slate-500">
          Line Items
        </p>
        <p class="mt-2 text-lg font-semibold text-slate-800">
          {{ props.lineItemCount }}
        </p>
      </div>
      <div>
        <p class="text-xs uppercase tracking-[0.18em] text-slate-500">
          Total Units
        </p>
        <p class="mt-2 text-lg font-semibold text-slate-800">
          {{ props.totalUnits }}
        </p>
      </div>
    </div>

    <div class="mt-6 space-y-4">
      <div class="flex items-start justify-between gap-4">
        <span class="text-sm text-slate-500">Customer ID</span>
        <span class="text-right font-medium text-slate-800">
          {{ props.order.customer_id }}
        </span>
      </div>
      <div class="flex items-start justify-between gap-4">
        <span class="text-sm text-slate-500">Created</span>
        <span class="text-right font-medium text-slate-800">
          {{ formatLongDate(props.order.created_at) }}
        </span>
      </div>
      <div class="flex items-start justify-between gap-4">
        <span class="text-sm text-slate-500">Updated</span>
        <span class="text-right font-medium text-slate-800">
          {{ formatLongDate(props.order.updated_at) }}
        </span>
      </div>
      <div class="flex items-start justify-between gap-4">
        <span class="text-sm text-slate-500">Approved By</span>
        <span class="text-right font-medium text-slate-800">
          {{ props.order.approved_by ?? "Pending review" }}
        </span>
      </div>
      <div v-if="props.order.rejection_reason" class="rounded-2xl bg-rose-50 p-4">
        <p class="text-xs uppercase tracking-[0.18em] text-rose-700">
          Rejection Reason
        </p>
        <p class="mt-2 text-sm leading-6 text-rose-800">
          {{ props.order.rejection_reason }}
        </p>
      </div>
      <div v-if="props.order.notes" class="rounded-2xl bg-slate-50 p-4">
        <p class="text-xs uppercase tracking-[0.18em] text-slate-500">
          Order Notes
        </p>
        <p class="mt-2 whitespace-pre-line text-sm leading-6 text-slate-700">
          {{ props.order.notes }}
        </p>
      </div>
    </div>
  </UCard>
</template>
