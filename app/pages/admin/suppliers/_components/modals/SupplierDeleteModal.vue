<script setup lang="ts">
import ActionConfirmModal from "~/pages/admin/_components/modals/ActionConfirmModal.vue";
import { useAdminDeleteFeedback } from "~/composables/admin/useAdminDeleteFeedback";
import type { Supplier } from "~/types/supplier";

const props = defineProps<{
  payload: Supplier | null;
}>();

const supplierStore = useSupplierStore();
const { getSingleDeleteDescription, handleSingleDelete } =
  useAdminDeleteFeedback();
const emit = defineEmits<{ close: [boolean] }>();

const payload = computed(() => ({
  eyebrow: "Delete Supplier",
  title: props.payload?.name ?? "Supplier",
  description: getSingleDeleteDescription("Supplier"),
  confirmLabel: "Delete",
  confirmColor: "error" as const,
  onConfirm: async () => {
    if (!props.payload?.id) return false;

    return handleSingleDelete(
      await supplierStore.deleteSupplier(props.payload.id),
      {
        resourceLabel: "Supplier",
        subject: props.payload.name ?? "the supplier",
      },
    );
  },
}));
</script>

<template>
  <ActionConfirmModal :payload="payload" @close="emit('close', $event)" />
</template>
