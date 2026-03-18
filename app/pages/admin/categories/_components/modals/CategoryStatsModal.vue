<script setup lang="ts">
import type { Category } from "~/types/category";
import { storeToRefs } from "pinia";
import { formatCurrency } from "~/utils/format";

const props = defineProps<{
  payload: Category | null;
}>();

const emit = defineEmits<{ close: [boolean] }>();
const productStore = useProductStore();
const orderStore = useOrderStore();
const { products } = storeToRefs(productStore);
const { orderItems } = storeToRefs(orderStore);

const categoryProducts = computed(() =>
  props.payload?.id
    ? products.value.filter((product) => product.category_id === props.payload?.id)
    : [],
);

const productCount = computed(() => categoryProducts.value.length);

const totalSales = computed(() => {
  const productIds = new Set(categoryProducts.value.map((p) => p.id));
  return orderItems.value
    .filter((item) => productIds.has(item.product_id))
    .reduce((sum, item) => sum + item.line_total, 0);
});
</script>

<template>
  <UModal :close="{ onClick: () => emit('close', false) }">
    <template #header>
      <div>
        <p class="text-xs uppercase tracking-[0.18em] text-slate-500">
          Category Performance
        </p>
        <h3 class="mt-2 text-lg font-semibold">
          {{ props.payload?.name ?? "Category" }}
        </h3>
      </div>
    </template>
    <template #body>
      <div class="grid gap-4 text-sm text-slate-600">
        <div class="rounded-lg border border-slate-200/70 p-4">
          <p class="text-xs uppercase tracking-[0.18em] text-slate-500">
            Product count
          </p>
          <p class="mt-2 text-lg font-semibold text-slate-800">
            {{ productCount }}
          </p>
        </div>
        <div class="rounded-lg border border-slate-200/70 p-4">
          <p class="text-xs uppercase tracking-[0.18em] text-slate-500">
            Estimated sales
          </p>
          <p class="mt-2 text-lg font-semibold text-slate-800">
            {{ formatCurrency(totalSales) }}
          </p>
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
