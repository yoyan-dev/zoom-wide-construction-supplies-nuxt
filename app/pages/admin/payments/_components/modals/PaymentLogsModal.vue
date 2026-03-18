<script setup lang="ts">
import type { Payment } from "~/types/payment";
import { storeToRefs } from "pinia";
import { formatLongDate } from "~/utils/format";

const props = defineProps<{
  payload: Payment | null;
}>();

const emit = defineEmits<{ close: [boolean] }>();
const paymentStore = usePaymentStore();
const { paymentActivity } = storeToRefs(paymentStore);

const activity = computed(() =>
  props.payload?.id ? paymentActivity.value[props.payload.id] ?? [] : [],
);
</script>

<template>
  <UModal :close="{ onClick: () => emit('close', false) }">
    <template #header>
      <div>
        <p class="text-xs uppercase tracking-[0.18em] text-slate-500">
          Payment Logs
        </p>
        <h3 class="mt-2 text-lg font-semibold">
          {{ props.payload?.id ?? "Payment" }}
        </h3>
      </div>
    </template>
    <template #body>
      <div class="space-y-3 text-sm text-slate-600">
        <div
          v-for="entry in activity"
          :key="entry.at + entry.action"
          class="rounded-lg border border-slate-200/70 p-3"
        >
          <p class="text-sm font-medium text-slate-800">{{ entry.action }}</p>
          <p class="text-xs text-slate-500">{{ formatLongDate(entry.at) }}</p>
          <p v-if="entry.detail" class="text-xs text-slate-500">
            {{ entry.detail }}
          </p>
        </div>
        <p v-if="!activity.length" class="text-sm text-slate-500">
          No payment logs recorded.
        </p>
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
