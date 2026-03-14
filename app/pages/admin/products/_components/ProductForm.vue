<script setup lang="ts">
import type { Category } from "~/types/category";
import type { Product } from "~/types/product";
import type { Supplier } from "~/types/supplier";

type ProductDraft = {
  name: string;
  sku: string;
  image_url: string | null;
  category_id: string;
  supplier_id: string | null;
  unit: string;
  price: number;
  stock_quantity: number;
  minimum_stock_quantity: number;
  description: string;
  is_active: boolean;
};

const props = defineProps<{
  product: Product | null;
  categories: Category[];
  suppliers: Supplier[];
  submitLabel: string;
  cancelTo: string;
}>();

const emit = defineEmits<{
  (e: "submit", value: ProductDraft): void;
}>();

const draft = ref<ProductDraft>({
  name: "",
  sku: "",
  image_url: "",
  category_id: "",
  supplier_id: null,
  unit: "unit",
  price: 0,
  stock_quantity: 0,
  minimum_stock_quantity: 0,
  description: "",
  is_active: true,
});

watch(
  () => props.product,
  (value) => {
    draft.value = {
      name: value?.name ?? "",
      sku: value?.sku ?? "",
      image_url: value?.image_url ?? "",
      category_id: value?.category_id ?? "",
      supplier_id: value?.supplier_id ?? null,
      unit: value?.unit ?? "unit",
      price: value?.price ?? 0,
      stock_quantity: value?.stock_quantity ?? 0,
      minimum_stock_quantity: value?.minimum_stock_quantity ?? 0,
      description: value?.description ?? "",
      is_active: value?.is_active ?? true,
    };
  },
  { immediate: true },
);

const categoryOptions = computed(() => [
  { label: "Select category", value: "" },
  ...props.categories.map((category) => ({
    label: category.name,
    value: category.id,
  })),
]);

const supplierOptions = computed(() => [
  { label: "Unassigned", value: "" },
  ...props.suppliers.map((supplier) => ({
    label: supplier.name,
    value: supplier.id,
  })),
]);

const submit = () => {
  emit("submit", {
    ...draft.value,
    image_url: draft.value.image_url || null,
    supplier_id: draft.value.supplier_id || null,
  });
};
</script>

<template>
  <UCard>
    <div class="grid gap-6 md:grid-cols-2">
      <UFormField label="Product name">
        <UInput v-model="draft.name" placeholder="Ready-Mix Concrete 25MPa" />
      </UFormField>
      <UFormField label="SKU">
        <UInput v-model="draft.sku" placeholder="CON-25MPA-001" />
      </UFormField>
      <UFormField label="Image URL">
        <UInput
          v-model="draft.image_url"
          placeholder="https://example.com/product.jpg"
        />
      </UFormField>
      <UFormField label="Category">
        <USelect v-model="draft.category_id" :items="categoryOptions" />
      </UFormField>
      <UFormField label="Supplier">
        <USelect v-model="draft.supplier_id" :items="supplierOptions" />
      </UFormField>
      <UFormField label="Unit of measure">
        <UInput v-model="draft.unit" placeholder="m³, bag, sheet" />
      </UFormField>
      <UFormField label="Unit price">
        <UInput v-model.number="draft.price" type="number" />
      </UFormField>
      <UFormField label="Stock quantity">
        <UInput v-model.number="draft.stock_quantity" type="number" />
      </UFormField>
      <UFormField label="Minimum stock">
        <UInput v-model.number="draft.minimum_stock_quantity" type="number" />
      </UFormField>
    </div>

    <div class="mt-6">
      <UFormField label="Description">
        <UTextarea
          v-model="draft.description"
          placeholder="Add a short product description..."
        />
      </UFormField>
    </div>

    <div
      class="mt-6 flex items-center justify-between rounded-2xl border border-slate-200/70 p-4"
    >
      <div>
        <p class="text-sm font-medium">Active in catalog</p>
        <p class="text-xs text-slate-500">
          Toggle visibility for customer orders.
        </p>
      </div>
      <USwitch v-model="draft.is_active" />
    </div>

    <div class="mt-6 flex justify-end gap-2">
      <UButton color="neutral" variant="ghost" :to="props.cancelTo">
        Cancel
      </UButton>
      <UButton color="primary" @click="submit">
        {{ props.submitLabel }}
      </UButton>
    </div>
  </UCard>
</template>
