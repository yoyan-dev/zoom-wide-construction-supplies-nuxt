<script setup lang="ts">
import type { Order } from "~/types/order";
import type { Payment } from "~/types/payment";
import { formatCurrency, formatLongDate } from "~/utils/format";

const props = defineProps<{
  payment: Payment;
  order: Order | null;
  orderBasePath?: string;
}>();
</script>

<template>
  <UCard>
    <div>
      <p class="text-xs uppercase tracking-[0.18em] text-slate-500">
        Related Order
      </p>
      <h2 class="mt-2 text-xl font-semibold text-slate-900">
        {{ props.order?.id ? `Order ${props.order.id}` : `Order ${props.payment.order_id}` }}
      </h2>
      <p class="mt-2 text-sm text-slate-600">
        Review the linked order context currently associated with this payment record.
      </p>
    </div>

    <div class="mt-6 space-y-4">
      <div class="flex items-start justify-between gap-4">
        <span class="text-sm text-slate-500">Order ID</span>
        <span class="text-right font-medium text-slate-800">
          {{ props.payment.order_id }}
        </span>
      </div>
      <div class="flex items-start justify-between gap-4">
        <span class="text-sm text-slate-500">Order Status</span>
        <span class="text-right font-medium text-slate-800">
          {{ props.order?.status ?? "Unavailable" }}
        </span>
      </div>
      <div class="flex items-start justify-between gap-4">
        <span class="text-sm text-slate-500">Order Total</span>
        <span class="text-right font-medium text-slate-800">
          {{
            props.order
              ? formatCurrency(props.order.total_amount ?? 0)
              : "Unavailable"
          }}
        </span>
      </div>
      <div class="flex items-start justify-between gap-4">
        <span class="text-sm text-slate-500">Created</span>
        <span class="text-right font-medium text-slate-800">
          {{
            props.order?.created_at
              ? formatLongDate(props.order.created_at)
              : "Unavailable"
          }}
        </span>
      </div>
      <div v-if="props.order?.notes" class="rounded-2xl bg-slate-50 p-4">
        <p class="text-xs uppercase tracking-[0.18em] text-slate-500">
          Order Notes
        </p>
        <p class="mt-2 whitespace-pre-line text-sm leading-6 text-slate-700">
          {{ props.order.notes }}
        </p>
      </div>
    </div>

    <div v-if="props.orderBasePath" class="mt-6 flex flex-wrap items-center gap-3">
      <UButton
        color="neutral"
        variant="outline"
        :to="`${props.orderBasePath}/${props.payment.order_id}`"
      >
        View Related Order
      </UButton>
    </div>
  </UCard>
</template>
