<script setup lang="ts">
import type { Payment } from "~/types/payment";
import { formatCurrency, formatLongDate } from "~/utils/format";

const props = defineProps<{
  payload: Payment | null;
}>();

const emit = defineEmits<{ close: [boolean] }>();
</script>

<template>
  <UModal :close="{ onClick: () => emit('close', false) }">
    <template #header>
      <div>
        <p class="text-xs uppercase tracking-[0.18em] text-slate-500">
          Receipt Preview
        </p>
        <h3 class="mt-2 text-lg font-semibold">
          {{ props.payload?.id ?? "Payment" }}
        </h3>
      </div>
    </template>
    <template #body>
      <div class="grid gap-3 text-sm text-slate-600">
        <div class="flex items-center justify-between">
          <span>Order</span>
          <span class="font-medium text-slate-800">
            {{ props.payload?.order_id ?? "N/A" }}
          </span>
        </div>
        <div class="flex items-center justify-between">
          <span>Amount</span>
          <span class="font-medium text-slate-800">
            {{
              props.payload
                ? formatCurrency(props.payload.amount)
                : "N/A"
            }}
          </span>
        </div>
        <div class="flex items-center justify-between">
          <span>Method</span>
          <span class="font-medium text-slate-800">
            {{ props.payload?.method ?? "N/A" }}
          </span>
        </div>
        <div class="flex items-center justify-between">
          <span>Status</span>
          <span class="font-medium text-slate-800">
            {{ props.payload?.status ?? "N/A" }}
          </span>
        </div>
        <div class="flex items-center justify-between">
          <span>Paid at</span>
          <span class="font-medium text-slate-800">
            {{
              props.payload?.paid_at
                ? formatLongDate(props.payload.paid_at)
                : "Pending"
            }}
          </span>
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
