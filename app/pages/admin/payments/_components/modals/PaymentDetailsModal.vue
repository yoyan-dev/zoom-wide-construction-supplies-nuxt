<script setup lang="ts">
import type { Payment } from "~/types/payment";
import { formatCurrency, formatLongDate } from "~/utils/format";

const props = defineProps<{
  payload: Payment | null;
}>();

const emit = defineEmits<{ close: [boolean] }>();
const payment = computed(() => props.payload);
</script>

<template>
  <UModal :close="{ onClick: () => emit('close', false) }">
    <template #header>
      <div>
        <p class="text-xs uppercase tracking-[0.18em] text-slate-500">
          Payment Details
        </p>
        <h3 class="mt-2 text-lg font-semibold">
          {{ payment?.id ?? "Payment" }}
        </h3>
      </div>
    </template>
    <template #body>
      <div class="grid gap-4 text-sm text-slate-600">
        <div class="grid gap-3 sm:grid-cols-2">
          <div>
            <p class="text-xs uppercase tracking-[0.18em] text-slate-500">
              Order
            </p>
            <p class="mt-1">{{ payment?.order_id ?? "N/A" }}</p>
          </div>
          <div>
            <p class="text-xs uppercase tracking-[0.18em] text-slate-500">
              Status
            </p>
            <p class="mt-1">{{ payment?.status ?? "Unknown" }}</p>
          </div>
        </div>
        <div class="grid gap-3 sm:grid-cols-2">
          <div>
            <p class="text-xs uppercase tracking-[0.18em] text-slate-500">
              Amount
            </p>
            <p class="mt-1">
              {{ payment ? formatCurrency(payment.amount) : "N/A" }}
            </p>
          </div>
          <div>
            <p class="text-xs uppercase tracking-[0.18em] text-slate-500">
              Method
            </p>
            <p class="mt-1">{{ payment?.method ?? "N/A" }}</p>
          </div>
        </div>
        <div class="grid gap-3 sm:grid-cols-2">
          <div>
            <p class="text-xs uppercase tracking-[0.18em] text-slate-500">
              Reference
            </p>
            <p class="mt-1">{{ payment?.transaction_ref ?? "No reference" }}</p>
          </div>
          <div>
            <p class="text-xs uppercase tracking-[0.18em] text-slate-500">
              Paid at
            </p>
            <p class="mt-1">
              {{ payment?.paid_at ? formatLongDate(payment.paid_at) : "Pending" }}
            </p>
          </div>
        </div>
        <div class="grid gap-3 sm:grid-cols-2">
          <div>
            <p class="text-xs uppercase tracking-[0.18em] text-slate-500">
              Created
            </p>
            <p class="mt-1">
              {{ payment ? formatLongDate(payment.created_at) : "N/A" }}
            </p>
          </div>
          <div>
            <p class="text-xs uppercase tracking-[0.18em] text-slate-500">
              Updated
            </p>
            <p class="mt-1">
              {{ payment ? formatLongDate(payment.updated_at) : "N/A" }}
            </p>
          </div>
        </div>
      </div>
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
