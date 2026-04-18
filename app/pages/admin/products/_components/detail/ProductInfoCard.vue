<script setup lang="ts">
import type { Product } from "~/types/product";
import { formatLongDate } from "~/utils/format";

const props = defineProps<{
  product: Product;
}>();

const detailRows = computed(() => [
  {
    label: "Category",
    value: props.product.category?.name ?? "Unassigned",
  },
  {
    label: "Warehouse",
    value: props.product.warehouse?.name ?? "Unassigned",
  },
  {
    label: "Unit",
    value: props.product.unit ?? "N/A",
  },
  {
    label: "Created",
    value: props.product.created_at
      ? formatLongDate(props.product.created_at)
      : "Unknown",
  },
  {
    label: "Updated",
    value: props.product.updated_at
      ? formatLongDate(props.product.updated_at)
      : "Unknown",
  },
]);
</script>

<template>
  <UCard>
    <div class="flex items-center justify-between gap-3">
      <div>
        <p class="text-xs uppercase tracking-[0.18em] text-slate-500">
          SKU
        </p>
        <p class="mt-2 text-xl font-semibold text-slate-900">
          {{ props.product.sku ?? "No SKU" }}
        </p>
      </div>
      <UBadge :color="props.product.is_active ? 'success' : 'neutral'" variant="subtle">
        {{ props.product.is_active ? "Active" : "Inactive" }}
      </UBadge>
    </div>

    <div class="mt-6 space-y-4">
      <div
        v-for="row in detailRows"
        :key="row.label"
        class="flex items-start justify-between gap-4"
      >
        <span class="text-sm text-slate-500">{{ row.label }}</span>
        <span class="text-right font-medium text-slate-800">
          {{ row.value }}
        </span>
      </div>
    </div>
  </UCard>
</template>
