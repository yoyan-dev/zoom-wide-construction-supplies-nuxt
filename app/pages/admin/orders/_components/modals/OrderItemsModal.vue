<script setup lang="ts">
import type { Order } from "~/types/order";
import { storeToRefs } from "pinia";
import { formatCurrency } from "~/utils/format";

const props = defineProps<{
  payload: Order | null;
}>();

const emit = defineEmits<{ close: [boolean] }>();
const orderStore = useOrderStore();
const { orderItems } = storeToRefs(orderStore);

const items = computed(() =>
  orderItems.value.filter((item) => item.order_id === props.payload?.id),
);
</script>

<template>
  <UModal :close="{ onClick: () => emit('close', false) }">
    <template #header>
      <div>
        <p class="text-xs uppercase tracking-[0.18em] text-slate-500">
          Ordered Items
        </p>
        <h3 class="mt-2 text-lg font-semibold">
          {{ props.payload?.id ?? "Order" }}
        </h3>
      </div>
    </template>
    <template #body>
      <div class="space-y-3 text-sm text-slate-600">
        <div
          v-for="item in items"
          :key="item.id"
          class="flex items-center justify-between rounded-lg border border-slate-200/70 p-3"
        >
          <div>
            <p class="text-sm font-medium text-slate-800">
              {{ item.product_id }}
            </p>
            <p class="text-xs text-slate-500">Item ID {{ item.id }}</p>
          </div>
          <div class="text-sm text-slate-600">
            {{ item.quantity }} x {{ item.unit_price }}
          </div>
          <div class="text-sm font-semibold text-slate-800">
            {{ formatCurrency(item.line_total) }}
          </div>
        </div>
        <p v-if="!items.length" class="text-sm text-slate-500">
          No items recorded for this order.
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
