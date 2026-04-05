<script setup lang="ts">
import type { Customer } from "~/types/customer";
import type { Payment } from "~/types/payment";
import { formatCurrency } from "~/utils/format";

const props = defineProps<{
  payment: Payment;
  customer: Customer | null;
}>();
</script>

<template>
  <UCard>
    <div>
      <p class="text-xs uppercase tracking-[0.18em] text-slate-500">
        Finance Summary
      </p>
      <h2 class="mt-2 text-xl font-semibold text-slate-900">
        {{ props.customer?.company_name ?? "Customer record unavailable" }}
      </h2>
      <p class="mt-2 text-sm text-slate-600">
        Lightweight finance-facing context for this payment record.
      </p>
    </div>

    <div class="mt-6 space-y-4">
      <div class="flex items-start justify-between gap-4">
        <span class="text-sm text-slate-500">Customer Contact</span>
        <span class="text-right font-medium text-slate-800">
          {{ props.customer?.contact_name ?? "Unavailable" }}
        </span>
      </div>
      <div class="flex items-start justify-between gap-4">
        <span class="text-sm text-slate-500">Email</span>
        <span class="text-right font-medium text-slate-800">
          {{ props.customer?.email ?? "Unavailable" }}
        </span>
      </div>
      <div class="flex items-start justify-between gap-4">
        <span class="text-sm text-slate-500">Amount</span>
        <span class="text-right font-medium text-slate-800">
          {{ formatCurrency(props.payment.amount ?? 0) }}
        </span>
      </div>
      <div class="flex items-start justify-between gap-4">
        <span class="text-sm text-slate-500">Transaction Ref</span>
        <span class="text-right font-medium text-slate-800">
          {{ props.payment.transaction_ref ?? "Not available" }}
        </span>
      </div>
    </div>
  </UCard>
</template>
