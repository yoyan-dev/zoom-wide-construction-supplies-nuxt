<script setup lang="ts">
import type { Category } from "~/types/category";
import type { Product } from "~/types/product";
import type { Supplier } from "~/types/supplier";

const props = defineProps<{
  open: boolean;
  product: Product | null;
  categories: Category[];
  suppliers: Supplier[];
}>();

const emit = defineEmits<{
  (e: "update:open", value: boolean): void;
}>();

const draft = ref({
  name: "",
  sku: "",
  category_id: "all",
  supplier_id: "all",
  price: 0,
  stock_quantity: 0,
  is_active: true,
});

watch(
  () => props.product,
  (value) => {
    draft.value = {
      name: value?.name ?? "",
      sku: value?.sku ?? "",
      category_id: value?.category_id ?? "all",
      supplier_id: value?.supplier_id ?? "all",
      price: value?.price ?? 0,
      stock_quantity: value?.stock_quantity ?? 0,
      is_active: value?.is_active ?? true,
    };
  },
  { immediate: true },
);

const categoryOptions = computed(() => [
  { label: "Select category", value: "all" },
  ...props.categories.map((category) => ({
    label: category.name,
    value: category.id,
  })),
]);

const supplierOptions = computed(() => [
  { label: "Select supplier", value: "all" },
  ...props.suppliers.map((supplier) => ({
    label: supplier.name,
    value: supplier.id,
  })),
]);
</script>

<template>
  <UModal :open="props.open" @update:open="emit('update:open', $event)">
    <template #header>
      <div>
        <p class="text-xs uppercase tracking-[0.18em] text-slate-500">
          Product Quick Edit
        </p>
        <h3 class="mt-2 text-lg font-semibold">
          {{ props.product?.name ?? "Product" }}
        </h3>
      </div>
    </template>

    <div class="space-y-4">
      <div class="grid gap-4 md:grid-cols-2">
        <UFormField label="Product name">
          <UInput v-model="draft.name" placeholder="Product name" />
        </UFormField>
        <UFormField label="SKU">
          <UInput v-model="draft.sku" placeholder="SKU" />
        </UFormField>
      </div>
      <div class="grid gap-4 md:grid-cols-2">
        <UFormField label="Category">
          <USelect v-model="draft.category_id" :items="categoryOptions" />
        </UFormField>
        <UFormField label="Supplier">
          <USelect v-model="draft.supplier_id" :items="supplierOptions" />
        </UFormField>
      </div>
      <div class="grid gap-4 md:grid-cols-2">
        <UFormField label="Unit price">
          <UInput v-model.number="draft.price" type="number" />
        </UFormField>
        <UFormField label="Stock quantity">
          <UInput v-model.number="draft.stock_quantity" type="number" />
        </UFormField>
      </div>
      <div
        class="flex items-center justify-between rounded-2xl border border-slate-200/70 p-4"
      >
        <div>
          <p class="text-sm font-medium">Active status</p>
          <p class="text-xs text-slate-500">
            Toggle visibility in the customer catalog.
          </p>
        </div>
        <USwitch v-model="draft.is_active" />
      </div>
    </div>

    <template #footer>
      <div class="flex justify-end gap-2">
        <UButton
          color="neutral"
          variant="ghost"
          @click="emit('update:open', false)"
        >
          Cancel
        </UButton>
        <UButton color="primary">Save Changes</UButton>
      </div>
    </template>
  </UModal>
</template>
