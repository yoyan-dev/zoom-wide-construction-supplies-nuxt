<script setup lang="ts">
import { useModal } from "~/composables/admin/useModal";
import type { Product } from "~/types/product";
import ProductDeleteModal from "../modals/ProductDeleteModal.vue";

const props = defineProps<{
  product: Product;
}>();

const { openModal } = useModal();
</script>
<template>
  <UPopover :dismissible="false" :ui="{ content: 'p-4' }">
    <UButton
      icon="i-lucide-ellipsis-vertical"
      variant="ghost"
      color="neutral"
    />

    <template #content="{ close }">
      <div class="flex items-center justify-between gap-4 mb-4 w-full">
        <h2 class="text-highlighted font-semibold">Actions</h2>

        <UButton
          color="neutral"
          variant="ghost"
          icon="i-lucide-x"
          @click="close"
        />
      </div>
      <div
        class="flex flex-col items-start min-w-48 border border-gray-100 rounded-sm p-2"
      >
        <UButton
          color="info"
          variant="ghost"
          size="sm"
          class="w-full"
          icon="i-lucide-eye"
          label="view product"
          :to="`/admin/products/${product.id}`"
        />
        <UButton
          color="primary"
          variant="ghost"
          size="sm"
          class="w-full"
          icon="i-lucide-pencil"
          label="edit product"
          :to="`/admin/products/edit/${product.id}`"
        >
          edit product
        </UButton>
        <UButton
          color="error"
          variant="ghost"
          size="sm"
          class="w-full"
          icon="i-lucide-trash"
          label="delete product"
          @click="openModal(ProductDeleteModal, props.product)"
        />
      </div>
    </template>
  </UPopover>
</template>
