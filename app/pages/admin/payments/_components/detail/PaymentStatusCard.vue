<script setup lang="ts">
import type { Payment } from "~/types/payment";
import PaymentStatusTimeline from "~/pages/orders/_components/shared/PaymentStatusTimeline.vue";
import {
  getPaymentStatusBadge,
  getPaymentStatusDescription,
} from "~/pages/orders/_components/shared/payment-status";
import { formatLongDate } from "~/utils/format";

const props = defineProps<{
  payment: Payment;
}>();

const statusBadge = computed(() => getPaymentStatusBadge(props.payment.status));
const statusDescription = computed(() =>
  getPaymentStatusDescription(props.payment.status),
);
</script>

<template>
  <UCard>
    <div class="flex items-start justify-between gap-4">
      <div>
        <p class="text-xs uppercase tracking-[0.18em] text-slate-500">
          Payment Status
        </p>
        <h2 class="mt-2 text-xl font-semibold text-slate-900">
          {{ statusBadge.label }}
        </h2>
        <p class="mt-2 text-sm leading-6 text-slate-600">
          {{ statusDescription }}
        </p>
      </div>

      <UBadge :color="statusBadge.color" variant="subtle">
        {{ statusBadge.label }}
      </UBadge>
    </div>

    <div class="mt-6 space-y-4">
      <div class="flex items-start justify-between gap-4">
        <span class="text-sm text-slate-500">Processed Date</span>
        <span class="text-right font-medium text-slate-800">
          {{
            props.payment.paid_at
              ? formatLongDate(props.payment.paid_at)
              : "Not processed yet"
          }}
        </span>
      </div>
      <div class="flex items-start justify-between gap-4">
        <span class="text-sm text-slate-500">Recorded Date</span>
        <span class="text-right font-medium text-slate-800">
          {{ formatLongDate(props.payment.created_at) }}
        </span>
      </div>
    </div>

    <div class="mt-6 border-t border-slate-200/70 pt-6">
      <p class="text-xs uppercase tracking-[0.18em] text-slate-500">
        Activity
      </p>
      <div class="mt-4">
        <PaymentStatusTimeline :payment="props.payment" />
      </div>
    </div>
  </UCard>
</template>
