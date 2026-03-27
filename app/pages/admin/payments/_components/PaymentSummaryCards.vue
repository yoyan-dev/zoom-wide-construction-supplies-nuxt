<script setup lang="ts">
import type { Payment } from "~/types/payment";
import { formatCurrency, formatNumber } from "~/utils/format";

const props = defineProps<{
  payments: Payment[];
}>();

const totals = computed(() => {
  const total = props.payments.length;
  const paid = props.payments.filter((payment) => payment.status === "paid");
  const pending = props.payments.filter((payment) => payment.status === "pending");
  const failed = props.payments.filter((payment) => payment.status === "failed");
  const refunded = props.payments.filter((payment) => payment.status === "refunded");
  const recordedAmount = props.payments.reduce(
    (sum, payment) => sum + (payment.amount ?? 0),
    0,
  );
  const paidAmount = paid.reduce((sum, payment) => sum + (payment.amount ?? 0), 0);
  const pendingAmount = pending.reduce(
    (sum, payment) => sum + (payment.amount ?? 0),
    0,
  );
  const refundedAmount = refunded.reduce(
    (sum, payment) => sum + (payment.amount ?? 0),
    0,
  );

  return {
    total,
    recordedAmount,
    paid: paid.length,
    failed: failed.length,
    pending: pending.length,
    refunded: refunded.length,
    paidAmount,
    pendingAmount,
    refundedAmount,
  };
});
</script>

<template>
  <section class="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
    <UCard>
      <p class="text-xs uppercase tracking-[0.18em] text-slate-500">
        Recorded Payments
      </p>
      <p class="mt-2 text-2xl font-semibold">
        {{ formatNumber(totals.total) }}
      </p>
      <p class="mt-1 text-sm text-slate-500">
        {{ formatCurrency(totals.recordedAmount) }} across the visible payment records
      </p>
    </UCard>

    <UCard class="border border-emerald-200/70 bg-emerald-50/40">
      <div class="flex items-start justify-between gap-4">
        <div>
          <p class="text-xs uppercase tracking-[0.18em] text-emerald-700">
            Paid
          </p>
          <p class="mt-2 text-2xl font-semibold">
            {{ formatCurrency(totals.paidAmount) }}
          </p>
          <p class="mt-1 text-sm text-slate-500">
            {{ formatNumber(totals.paid) }} confirmed payment records
          </p>
        </div>

        <UBadge color="success" variant="subtle">
          Paid
        </UBadge>
      </div>
    </UCard>

    <UCard class="border border-amber-200/70 bg-amber-50/40">
      <div class="flex items-start justify-between gap-4">
        <div>
          <p class="text-xs uppercase tracking-[0.18em] text-amber-700">
            Pending
          </p>
          <p class="mt-2 text-2xl font-semibold">
            {{ formatCurrency(totals.pendingAmount) }}
          </p>
          <p class="mt-1 text-sm text-slate-500">
            {{ formatNumber(totals.pending) }} records awaiting confirmation
          </p>
        </div>

        <UBadge color="warning" variant="subtle">
          Pending
        </UBadge>
      </div>
    </UCard>

    <UCard class="border border-rose-200/70 bg-rose-50/40">
      <p class="text-xs uppercase tracking-[0.18em] text-rose-700">
        Exceptions
      </p>
      <div class="mt-4 space-y-3">
        <div class="flex items-start justify-between gap-4">
          <div>
            <p class="text-sm font-medium text-slate-900">
              Failed
            </p>
            <p class="mt-1 text-sm text-slate-500">
              {{ formatNumber(totals.failed) }} unsuccessful records
            </p>
          </div>

          <UBadge color="error" variant="subtle">
            Failed
          </UBadge>
        </div>

        <div class="flex items-start justify-between gap-4 border-t border-rose-200/70 pt-3">
          <div>
            <p class="text-sm font-medium text-slate-900">
              Refunded
            </p>
            <p class="mt-1 text-sm text-slate-500">
              {{ formatNumber(totals.refunded) }} records - {{ formatCurrency(totals.refundedAmount) }}
            </p>
          </div>

          <UBadge color="neutral" variant="subtle">
            Refunded
          </UBadge>
        </div>
      </div>
    </UCard>
  </section>
</template>
