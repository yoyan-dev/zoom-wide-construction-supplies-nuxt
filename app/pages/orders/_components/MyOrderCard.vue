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

const statusBadgeClass = computed(() => {
  switch (props.order.status) {
    case "approved":
      return "border-emerald-200 bg-emerald-50 text-emerald-700";
    case "rejected":
      return "border-rose-200 bg-rose-50 text-rose-700";
    case "cancelled":
      return "border-slate-200 bg-slate-100 text-slate-700";
    case "completed":
      return "border-sky-200 bg-sky-50 text-sky-700";
    default:
      return "border-amber-200 bg-amber-50 text-amber-700";
  }
});
</script>

<template>
  <StorefrontSectionCard class="bg-white" padding="lg">
    <div class="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
      <div class="min-w-0">
        <div class="flex flex-wrap items-center gap-3">
          <p class="text-xl font-bold tracking-tight text-slate-950">
            Order {{ props.order.id }}
          </p>
          <span
            class="rounded-md border px-2.5 py-1 text-[0.68rem] font-semibold uppercase tracking-[0.16em]"
            :class="statusBadgeClass"
          >
            {{ statusBadge.label }}
          </span>
        </div>

        <p class="mt-2 text-sm leading-7 text-slate-600">
          Submitted {{ formatLongDate(props.order.created_at) }}
        </p>

        <div class="mt-5 grid gap-4 sm:grid-cols-2">
          <div>
            <p class="text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-slate-500">
              Total
            </p>
            <p class="mt-2 text-lg font-bold tracking-tight text-slate-950">
              {{ formatCurrency(props.order.total_amount ?? 0) }}
            </p>
          </div>

          <div>
            <p class="text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-slate-500">
              Last Updated
            </p>
            <p class="mt-2 text-sm font-semibold text-slate-900">
              {{ formatLongDate(props.order.updated_at) }}
            </p>
          </div>
        </div>

        <p v-if="props.order.notes" class="mt-4 line-clamp-2 text-sm leading-7 text-slate-600">
          {{ props.order.notes }}
        </p>
      </div>

      <div class="flex shrink-0 flex-col gap-3 lg:items-end">
        <StorefrontButton tone="primary" :to="`/orders/${props.order.id}`">
          View Tracking
        </StorefrontButton>
      </div>
    </div>
  </StorefrontSectionCard>
</template>
