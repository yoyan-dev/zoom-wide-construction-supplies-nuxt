<script setup lang="ts">
import type { Payment } from "~/types/payment";
import { formatCurrency, formatLongDate, formatShortDateOrFallback } from "~/utils/format";
import PaymentStatusTimeline from "./shared/PaymentStatusTimeline.vue";
import {
  getPaymentStatusBadge,
  getPaymentStatusDescription,
} from "./shared/payment-status";

const props = defineProps<{
  payment: Payment | null;
  isLoading?: boolean;
  loadError?: string | null;
}>();

const paymentMethodLabel = (method: Payment["method"]) => {
  switch (method) {
    case "bank_transfer":
      return "Bank Transfer";
    case "mobile_wallet":
      return "Mobile Wallet";
    case "card":
      return "Card";
    default:
      return "Cash";
  }
};
</script>

<template>
  <UCard>
    <div class="flex flex-wrap items-center justify-between gap-4">
      <div>
        <p class="text-xs uppercase tracking-[0.18em] text-slate-500">
          Payment Visibility
        </p>
        <h2 class="mt-2 text-xl font-semibold text-slate-900">
          Payment updates
        </h2>
        <p class="mt-2 text-sm text-slate-600">
          Review the latest payment state for this order using the current payment records available.
        </p>
      </div>

      <UBadge
        :color="getPaymentStatusBadge(props.payment?.status).color"
        variant="subtle"
      >
        {{ getPaymentStatusBadge(props.payment?.status).label }}
      </UBadge>
    </div>

    <div v-if="props.isLoading" class="mt-6 space-y-4">
      <USkeleton class="h-5 w-40" />
      <USkeleton class="h-4 w-full" />
      <USkeleton class="h-4 w-4/5" />
    </div>

    <div
      v-else-if="props.loadError"
      class="mt-6 rounded-2xl border border-dashed border-rose-200 bg-rose-50/60 px-6 py-8"
    >
      <p class="text-sm font-medium text-rose-900">
        Payment updates unavailable
      </p>
      <p class="mt-2 text-sm text-rose-700">
        {{ props.loadError }}
      </p>
    </div>

    <div
      v-else-if="!props.payment"
      class="mt-6 rounded-2xl border border-dashed border-slate-200 bg-slate-50/70 px-6 py-8"
    >
      <p class="text-sm font-medium text-slate-900">
        No payment recorded yet
      </p>
      <p class="mt-2 text-sm text-slate-600">
        Payment details will appear here once a payment record is created for this order.
      </p>
    </div>

    <template v-else>
      <div class="mt-6 grid gap-4 md:grid-cols-2">
        <div>
          <p class="text-xs uppercase tracking-[0.18em] text-slate-500">
            Payment Reference
          </p>
          <p class="mt-2 font-medium text-slate-900">
            {{ props.payment.id }}
          </p>
        </div>

        <div>
          <p class="text-xs uppercase tracking-[0.18em] text-slate-500">
            Amount
          </p>
          <p class="mt-2 font-medium text-slate-900">
            {{ formatCurrency(props.payment.amount ?? 0) }}
          </p>
        </div>

        <div>
          <p class="text-xs uppercase tracking-[0.18em] text-slate-500">
            Method
          </p>
          <p class="mt-2 font-medium text-slate-900">
            {{ paymentMethodLabel(props.payment.method) }}
          </p>
        </div>

        <div>
          <p class="text-xs uppercase tracking-[0.18em] text-slate-500">
            Processed
          </p>
          <p class="mt-2 font-medium text-slate-900">
            {{
              props.payment.paid_at
                ? formatLongDate(props.payment.paid_at)
                : "Not processed yet"
            }}
          </p>
        </div>

        <div>
          <p class="text-xs uppercase tracking-[0.18em] text-slate-500">
            Transaction Reference
          </p>
          <p class="mt-2 font-medium text-slate-900">
            {{ props.payment.transaction_ref ?? "No transaction reference" }}
          </p>
        </div>

        <div>
          <p class="text-xs uppercase tracking-[0.18em] text-slate-500">
            Recorded
          </p>
          <p class="mt-2 font-medium text-slate-900">
            {{ formatShortDateOrFallback(props.payment.created_at) }}
          </p>
        </div>
      </div>

      <div class="mt-6 rounded-2xl bg-slate-50 p-4">
        <p class="text-sm font-medium text-slate-900">
          {{ getPaymentStatusDescription(props.payment.status) }}
        </p>
      </div>

      <div class="mt-6">
        <PaymentStatusTimeline :payment="props.payment" />
      </div>
    </template>
  </UCard>
</template>
