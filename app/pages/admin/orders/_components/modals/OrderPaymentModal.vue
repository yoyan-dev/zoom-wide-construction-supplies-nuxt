<script setup lang="ts">
import type { Order } from "~/types/order";
import { storeToRefs } from "pinia";
import { formatCurrency, formatLongDate } from "~/utils/format";

const props = defineProps<{
  payload: Order | null;
}>();

const emit = defineEmits<{ close: [boolean] }>();
const paymentStore = usePaymentStore();
const { payments } = storeToRefs(paymentStore);

const payment = computed(() =>
  payments.value.find((item) => item.order_id === props.payload?.id),
);
</script>

<template>
  <UModal :close="{ onClick: () => emit('close', false) }">
    <template #header>
      <div>
        <p class="text-xs uppercase tracking-[0.18em] text-slate-500">
          Order Payment
        </p>
        <h3 class="mt-2 text-lg font-semibold">
          {{ props.payload?.id ?? "Order" }}
        </h3>
      </div>
    </template>
    <template #body>
      <div v-if="payment" class="grid gap-4 text-sm text-slate-600">
        <div class="grid gap-3 sm:grid-cols-2">
          <div>
            <p class="text-xs uppercase tracking-[0.18em] text-slate-500">
              Status
            </p>
            <p class="mt-1">{{ payment.status }}</p>
          </div>
          <div>
            <p class="text-xs uppercase tracking-[0.18em] text-slate-500">
              Amount
            </p>
            <p class="mt-1">{{ formatCurrency(payment.amount) }}</p>
          </div>
        </div>
        <div class="grid gap-3 sm:grid-cols-2">
          <div>
            <p class="text-xs uppercase tracking-[0.18em] text-slate-500">
              Method
            </p>
            <p class="mt-1">{{ payment.method }}</p>
          </div>
          <div>
            <p class="text-xs uppercase tracking-[0.18em] text-slate-500">
              Reference
            </p>
            <p class="mt-1">{{ payment.transaction_ref ?? "No reference" }}</p>
          </div>
        </div>
        <div>
          <p class="text-xs uppercase tracking-[0.18em] text-slate-500">
            Paid at
          </p>
          <p class="mt-1">
            {{ payment.paid_at ? formatLongDate(payment.paid_at) : "Pending" }}
          </p>
        </div>
      </div>
      <p v-else class="text-sm text-slate-500">
        No payment record linked to this order.
      </p>
    </template>
    <template #footer>
      <div class="flex justify-end w-full">
        <UButton color="neutral" variant="ghost" @click="emit('close', false)">
          Close
        </UButton>
      </div>
    </template>
  </UModal>
</template>
