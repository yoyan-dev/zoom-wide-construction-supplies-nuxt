<script setup lang="ts">
import type { Product } from "~/types/product";
import { formatCurrency, formatLongDate } from "~/utils/format";

const props = defineProps<{
  payload: Product | null;
}>();

const emit = defineEmits<{ close: [boolean] }>();
const product = computed(() => props.payload);
</script>

<template>
  <UModal :close="{ onClick: () => emit('close', false) }">
    <template #header>
      <div>
        <p class="text-xs uppercase tracking-[0.18em] text-slate-500">
          Product Details
        </p>
        <h3 class="mt-2 text-lg font-semibold">
          {{ product?.name ?? "Product" }}
        </h3>
      </div>
    </template>
    <template #body>
      <div class="grid gap-4 text-sm text-slate-600">
        <div class="grid gap-3 sm:grid-cols-2">
          <div>
            <p class="text-xs uppercase tracking-[0.18em] text-slate-500">
              SKU
            </p>
            <p class="mt-1">{{ product?.sku ?? "N/A" }}</p>
          </div>
          <div>
            <p class="text-xs uppercase tracking-[0.18em] text-slate-500">
              Price
            </p>
            <p class="mt-1">
              {{
                product?.price !== undefined
                  ? formatCurrency(product.price)
                  : "N/A"
              }}
            </p>
          </div>
        </div>
        <div class="grid gap-3 sm:grid-cols-2">
          <div>
            <p class="text-xs uppercase tracking-[0.18em] text-slate-500">
              Stock
            </p>
            <p class="mt-1">{{ product?.stock_quantity ?? 0 }}</p>
          </div>
          <div>
            <p class="text-xs uppercase tracking-[0.18em] text-slate-500">
              Minimum stock
            </p>
            <p class="mt-1">{{ product?.minimum_stock_quantity ?? 0 }}</p>
          </div>
        </div>
        <div>
          <p class="text-xs uppercase tracking-[0.18em] text-slate-500">
            Description
          </p>
          <p class="mt-1">
            {{ product?.description ?? "No description available." }}
          </p>
        </div>
        <div class="grid gap-3 sm:grid-cols-2">
          <div>
            <p class="text-xs uppercase tracking-[0.18em] text-slate-500">
              Status
            </p>
            <p class="mt-1">
              {{ product?.is_active ? "Active" : "Inactive" }}
            </p>
          </div>
          <div>
            <p class="text-xs uppercase tracking-[0.18em] text-slate-500">
              Updated
            </p>
            <p class="mt-1">
              {{ product?.updated_at ? formatLongDate(product.updated_at) : "N/A" }}
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
