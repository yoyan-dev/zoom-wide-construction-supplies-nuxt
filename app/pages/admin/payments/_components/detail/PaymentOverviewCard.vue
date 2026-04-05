<script setup lang="ts">
import type { Payment } from "~/types/payment";
import { formatCurrency, formatLongDate } from "~/utils/format";

const props = defineProps<{
  payment: Payment;
}>();

const paymentMethodLabel = computed(() => {
  switch (props.payment.method) {
    case "bank_transfer":
      return "Bank Transfer";
    case "mobile_wallet":
      return "Mobile Wallet";
    case "card":
      return "Card";
    default:
      return "Cash";
  }
});
</script>

<template>
  <UCard>
    <div>
      <p class="text-xs uppercase tracking-[0.18em] text-slate-500">
        Payment Overview
      </p>
      <h2 class="mt-2 text-xl font-semibold text-slate-900">
        {{ formatCurrency(props.payment.amount ?? 0) }}
      </h2>
      <p class="mt-2 text-sm text-slate-600">
        Review core payment record details and transaction identifiers.
      </p>
    </div>

    <div class="mt-6 space-y-4">
      <div class="flex items-start justify-between gap-4">
        <span class="text-sm text-slate-500">Payment ID</span>
        <span class="text-right font-medium text-slate-800">
          {{ props.payment.id }}
        </span>
      </div>
      <div class="flex items-start justify-between gap-4">
        <span class="text-sm text-slate-500">Method</span>
        <span class="text-right font-medium text-slate-800">
          {{ paymentMethodLabel }}
        </span>
      </div>
      <div class="flex items-start justify-between gap-4">
        <span class="text-sm text-slate-500">Transaction Ref</span>
        <span class="text-right font-medium text-slate-800">
          {{ props.payment.transaction_ref ?? "Not available" }}
        </span>
      </div>
      <div class="flex items-start justify-between gap-4">
        <span class="text-sm text-slate-500">Created</span>
        <span class="text-right font-medium text-slate-800">
          {{ formatLongDate(props.payment.created_at) }}
        </span>
      </div>
      <div class="flex items-start justify-between gap-4">
        <span class="text-sm text-slate-500">Updated</span>
        <span class="text-right font-medium text-slate-800">
          {{ formatLongDate(props.payment.updated_at) }}
        </span>
      </div>
    </div>
  </UCard>
</template>
