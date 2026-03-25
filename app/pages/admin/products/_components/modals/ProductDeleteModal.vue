<script setup lang="ts">
import ActionConfirmModal from "~/pages/admin/_components/modals/ActionConfirmModal.vue";
import { useAdminDeleteFeedback } from "~/composables/admin/useAdminDeleteFeedback";
import type { Product } from "~/types/product";

const props = defineProps<{
  payload: Product | null;
}>();

const productStore = useProductStore();
const { getSingleDeleteDescription, handleSingleDelete } =
  useAdminDeleteFeedback();
const emit = defineEmits<{ close: [boolean] }>();

const title = computed(() =>
  [props.payload?.name ?? "Product", props.payload?.sku]
    .filter(Boolean)
    .join(" - "),
);

const payload = computed(() => ({
  eyebrow: "Delete Product",
  title: title.value,
  description: getSingleDeleteDescription("Product"),
  confirmLabel: "Delete",
  confirmColor: "error" as const,
  onConfirm: async () => {
    if (!props.payload?.id) return false;

    return handleSingleDelete(
      await productStore.deleteProduct(props.payload.id),
      {
        resourceLabel: "Product",
        subject: props.payload.name ?? "the product",
      },
    );
  },
}));
</script>

<template>
  <ActionConfirmModal :payload="payload" @close="emit('close', $event)" />
</template>
