<script setup lang="ts">
import type { Delivery } from "~/types/delivery";
import { storeToRefs } from "pinia";
import { formatCurrency } from "~/utils/format";

const props = defineProps<{
  payload: Delivery | null;
}>();

const emit = defineEmits<{ close: [boolean] }>();
const orderStore = useOrderStore();
const { orderItems } = storeToRefs(orderStore);

const items = computed(() =>
  orderItems.value.filter((item) => item.order_id === props.payload?.order_id),
);
</script>

<template>
  <UModal :close="{ onClick: () => emit('close', false) }">
    <template #header>
      <div>
        <p class="text-xs uppercase tracking-[0.18em] text-slate-500">
          Delivery Items
        </p>
        <h3 class="mt-2 text-lg font-semibold">
          {{ props.payload?.id ?? "Delivery" }}
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
          No items associated with this delivery.
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
