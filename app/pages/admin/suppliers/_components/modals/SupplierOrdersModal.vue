<script setup lang="ts">
import type { Supplier } from "~/types/supplier";
import { storeToRefs } from "pinia";
import { formatCurrency } from "~/utils/format";

const props = defineProps<{
  payload: Supplier | null;
}>();

const emit = defineEmits<{ close: [boolean] }>();
const productStore = useProductStore();
const orderStore = useOrderStore();
const { products } = storeToRefs(productStore);
const { orders, orderItems } = storeToRefs(orderStore);

onMounted(async () => {
  if (!orders.value.length) {
    await orderStore.fetchOrders();
  }
});

const supplierProductIds = computed(() =>
  products.value
    .filter((product) => product.supplier_id === props.payload?.id)
    .map((product) => product.id)
    .filter((id): id is string => Boolean(id)),
);

const orderSummary = computed(() => {
  const productIdSet = new Set(supplierProductIds.value);
  const totals = new Map<string, number>();
  const counts = new Map<string, number>();

  for (const item of orderItems.value) {
    if (!productIdSet.has(item.product_id)) continue;
    totals.set(item.order_id, (totals.get(item.order_id) ?? 0) + item.line_total);
    counts.set(item.order_id, (counts.get(item.order_id) ?? 0) + item.quantity);
  }

  return Array.from(totals.entries()).map(([orderId, total]) => {
    const order = orders.value.find((entry) => entry.id === orderId);
    return {
      orderId,
      total,
      quantity: counts.get(orderId) ?? 0,
      status: order?.status ?? "unknown",
    };
  });
});
</script>

<template>
  <UModal :close="{ onClick: () => emit('close', false) }">
    <template #header>
      <div>
        <p class="text-xs uppercase tracking-[0.18em] text-slate-500">
          Supplier Orders
        </p>
        <h3 class="mt-2 text-lg font-semibold">
          {{ props.payload?.name ?? "Supplier" }}
        </h3>
      </div>
    </template>
    <template #body>
      <div class="space-y-3 text-sm text-slate-600">
        <div
          v-for="entry in orderSummary"
          :key="entry.orderId"
          class="flex items-center justify-between rounded-lg border border-slate-200/70 p-3"
        >
          <div>
            <p class="text-sm font-medium text-slate-800">
              Order {{ entry.orderId }}
            </p>
            <p class="text-xs text-slate-500">Status: {{ entry.status }}</p>
          </div>
          <div class="text-sm text-slate-600">
            Qty {{ entry.quantity }}
          </div>
          <div class="text-sm font-semibold text-slate-800">
            {{ formatCurrency(entry.total) }}
          </div>
        </div>
        <p v-if="!orderSummary.length" class="text-sm text-slate-500">
          No orders linked to this supplier yet.
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
