<script setup lang="ts">
import type { Supplier } from "~/types/supplier";
import ActionConfirmModal from "~/pages/admin/_components/modals/ActionConfirmModal.vue";
import { useAdminDeleteFeedback } from "~/composables/admin/useAdminDeleteFeedback";

const props = defineProps<{
  payload: Supplier | null;
}>();

const supplierStore = useSupplierStore();
const { getSingleDeleteDescription, handleSingleDelete } =
  useAdminDeleteFeedback();
const emit = defineEmits<{ close: [boolean] }>();

const payload = computed(() => ({
  eyebrow: "Delete Supplier",
  title: props.payload?.business_name ?? "Supplier",
  description: getSingleDeleteDescription("Supplier"),
  confirmLabel: "Delete",
  confirmColor: "error" as const,
  onConfirm: async () => {
    if (!props.payload?.id) return false;

    return handleSingleDelete(
      await supplierStore.deleteSupplier(props.payload.id),
      {
        resourceLabel: "Supplier",
        subject: props.payload.business_name ?? "the supplier account",
      },
    );
  },
}));
</script>

<template>
  <ActionConfirmModal :payload="payload" @close="emit('close', $event)" />
</template>
