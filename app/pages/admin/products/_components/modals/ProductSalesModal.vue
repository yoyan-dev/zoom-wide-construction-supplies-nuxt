<script setup lang="ts">
import type { Product } from "~/types/product";
import { storeToRefs } from "pinia";
import { formatCurrency } from "~/utils/format";

const props = defineProps<{
  payload: Product | null;
}>();

const emit = defineEmits<{ close: [boolean] }>();
const orderStore = useOrderStore();
const { orderItems } = storeToRefs(orderStore);

const salesItems = computed(() => {
  if (!props.payload?.id) return [];
  return orderItems.value.filter(
    (item) => item.product_id === props.payload?.id,
  );
});

const totalSales = computed(() =>
  salesItems.value.reduce((sum, item) => sum + item.line_total, 0),
);
</script>

<template>
  <UModal :close="{ onClick: () => emit('close', false) }">
    <template #header>
      <div>
        <p class="text-xs uppercase tracking-[0.18em] text-slate-500">
          Sales History
        </p>
        <h3 class="mt-2 text-lg font-semibold">
          {{ props.payload?.name ?? "Product" }}
        </h3>
      </div>
    </template>
    <template #body>
      <div class="space-y-3 text-sm text-slate-600">
        <div class="flex items-center justify-between rounded-lg border border-slate-200/70 p-3">
          <span>Total sales</span>
          <span class="font-semibold text-slate-800">
            {{ formatCurrency(totalSales) }}
          </span>
        </div>
        <div
          v-for="item in salesItems"
          :key="item.id"
          class="flex items-center justify-between rounded-lg border border-slate-200/70 p-3"
        >
          <div>
            <p class="text-sm font-medium text-slate-800">
              Order {{ item.order_id }}
            </p>
            <p class="text-xs text-slate-500">Item {{ item.id }}</p>
          </div>
          <div class="text-sm text-slate-600">
            {{ item.quantity }} x {{ item.unit_price }}
          </div>
          <div class="text-sm font-semibold text-slate-800">
            {{ formatCurrency(item.line_total) }}
          </div>
        </div>
        <p v-if="!salesItems.length" class="text-sm text-slate-500">
          No sales recorded for this product.
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
