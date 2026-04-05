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
  order: Order | null;
  orderBasePath: string;
}>();

const statusBadge = computed<{ color: BadgeColor; label: string }>(() => {
  if (!props.order) {
    return { color: "neutral", label: "Unavailable" };
  }

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
    <div class="flex flex-wrap items-center justify-between gap-4">
      <div>
        <p class="text-xs uppercase tracking-[0.18em] text-slate-500">
          Related Order
        </p>
        <h2 class="mt-2 text-xl font-semibold text-slate-900">
          Order summary
        </h2>
      </div>

      <UBadge :color="statusBadge.color" variant="subtle">
        {{ statusBadge.label }}
      </UBadge>
    </div>

    <div
      v-if="props.order"
      class="mt-6 grid gap-4 md:grid-cols-2"
    >
      <div>
        <p class="text-xs uppercase tracking-[0.18em] text-slate-500">
          Order Reference
        </p>
        <NuxtLink
          :to="`${props.orderBasePath}/${props.order.id}`"
          class="mt-2 inline-flex font-medium text-slate-900 transition hover:text-primary"
        >
          {{ props.order.id }}
        </NuxtLink>
      </div>

      <div>
        <p class="text-xs uppercase tracking-[0.18em] text-slate-500">
          Total Amount
        </p>
        <p class="mt-2 font-medium text-slate-900">
          {{ formatCurrency(props.order.total_amount ?? 0) }}
        </p>
      </div>

      <div>
        <p class="text-xs uppercase tracking-[0.18em] text-slate-500">
          Submitted
        </p>
        <p class="mt-2 font-medium text-slate-900">
          {{ formatLongDate(props.order.created_at) }}
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

    <div
      v-if="props.order?.notes"
      class="mt-6 rounded-2xl bg-slate-50 p-4"
    >
      <p class="text-xs uppercase tracking-[0.18em] text-slate-500">
        Order Notes
      </p>
      <p class="mt-2 whitespace-pre-line text-sm leading-6 text-slate-700">
        {{ props.order.notes }}
      </p>
    </div>

    <div
      v-else-if="!props.order"
      class="mt-6 rounded-2xl border border-dashed border-slate-200 bg-slate-50/70 px-6 py-8"
    >
      <p class="text-sm font-medium text-slate-900">
        Linked order unavailable
      </p>
      <p class="mt-2 text-sm text-slate-600">
        This delivery can still be reviewed even when the related order summary is not currently returned.
      </p>
    </div>
  </UCard>
</template>
