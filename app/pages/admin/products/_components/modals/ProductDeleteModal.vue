<script setup lang="ts">
import type { Product } from "~/types/product";

const props = defineProps<{
  payload: Product | null;
}>();

const product = ref<Product | null>(props.payload);
const productStore = useProductStore();

const emit = defineEmits<{ close: [boolean] }>();

const handleDelete = async () => {
  if (!product.value?.id) return;
  await productStore.deleteProduct(product.value.id);
  emit("close", false);
};
</script>

<template>
  <UModal :close="{ onClick: () => emit('close', false) }">
    <template #header>
      <div>
        <p class="text-xs uppercase tracking-[0.18em] text-slate-500">
          Delete Product
        </p>
        <h3 class="mt-2 text-lg font-semibold">
          {{ [product?.name ?? "Product", product?.sku ?? ""].join(" - ") }}
        </h3>
      </div>
    </template>

    <template #body>
      <div class="text-sm text-slate-600">
        This action cannot be undone. Are you sure you want to delete this
        product?
      </div>
    </template>

    <template #footer>
      <div class="flex justify-end gap-2 w-full">
        <UButton color="neutral" variant="ghost" @click="emit('close', false)">
          Cancel
        </UButton>
        <UButton
          color="error"
          :loading="productStore.isLoading"
          @click="handleDelete"
        >
          Delete
        </UButton>
      </div>
    </template>
  </UModal>
</template>
