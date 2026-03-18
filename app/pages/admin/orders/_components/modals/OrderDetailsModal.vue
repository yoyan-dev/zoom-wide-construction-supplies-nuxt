<script setup lang="ts">
import type { Order } from "~/types/order";
import { formatCurrency, formatLongDate } from "~/utils/format";

const props = defineProps<{
  payload: Order | null;
}>();

const emit = defineEmits<{ close: [boolean] }>();
const order = computed(() => props.payload);
</script>

<template>
  <UModal :close="{ onClick: () => emit('close', false) }">
    <template #header>
      <div>
        <p class="text-xs uppercase tracking-[0.18em] text-slate-500">
          Order Details
        </p>
        <h3 class="mt-2 text-lg font-semibold">
          {{ order?.id ?? "Order" }}
        </h3>
      </div>
    </template>
    <template #body>
      <div class="grid gap-4 text-sm text-slate-600">
        <div class="grid gap-3 sm:grid-cols-2">
          <div>
            <p class="text-xs uppercase tracking-[0.18em] text-slate-500">
              Status
            </p>
            <p class="mt-1">{{ order?.status ?? "Unknown" }}</p>
          </div>
          <div>
            <p class="text-xs uppercase tracking-[0.18em] text-slate-500">
              Total
            </p>
            <p class="mt-1">
              {{ order ? formatCurrency(order.total_amount) : "N/A" }}
            </p>
          </div>
        </div>
        <div>
          <p class="text-xs uppercase tracking-[0.18em] text-slate-500">
            Notes
          </p>
          <p class="mt-1">{{ order?.notes ?? "No notes recorded." }}</p>
        </div>
        <div class="grid gap-3 sm:grid-cols-2">
          <div>
            <p class="text-xs uppercase tracking-[0.18em] text-slate-500">
              Approved by
            </p>
            <p class="mt-1">{{ order?.approved_by ?? "Pending" }}</p>
          </div>
          <div>
            <p class="text-xs uppercase tracking-[0.18em] text-slate-500">
              Rejection reason
            </p>
            <p class="mt-1">{{ order?.rejection_reason ?? "N/A" }}</p>
          </div>
        </div>
        <div class="grid gap-3 sm:grid-cols-2">
          <div>
            <p class="text-xs uppercase tracking-[0.18em] text-slate-500">
              Created
            </p>
            <p class="mt-1">
              {{ order ? formatLongDate(order.created_at) : "N/A" }}
            </p>
          </div>
          <div>
            <p class="text-xs uppercase tracking-[0.18em] text-slate-500">
              Updated
            </p>
            <p class="mt-1">
              {{ order ? formatLongDate(order.updated_at) : "N/A" }}
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
