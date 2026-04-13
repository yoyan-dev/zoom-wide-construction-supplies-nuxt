<script setup lang="ts">
import type { Warehouse } from "~/types/warehouse";
import ActionConfirmModal from "~/pages/admin/_components/modals/ActionConfirmModal.vue";
import { useAdminDeleteFeedback } from "~/composables/admin/useAdminDeleteFeedback";

const props = defineProps<{
  payload: Warehouse | null;
}>();

const warehouseStore = useWarehouseStore();
const { getSingleDeleteDescription, handleSingleDelete } =
  useAdminDeleteFeedback();
const emit = defineEmits<{ close: [boolean] }>();

const payload = computed(() => ({
  eyebrow: "Delete Warehouse",
  title: props.payload?.name ?? "Warehouse",
  description: getSingleDeleteDescription("Warehouse"),
  confirmLabel: "Delete",
  confirmColor: "error" as const,
  onConfirm: async () => {
    if (!props.payload?.id) return false;

    return handleSingleDelete(
      await warehouseStore.deleteWarehouse(props.payload.id),
      {
        resourceLabel: "Warehouse",
        subject: props.payload.name ?? "the warehouse",
      },
    );
  },
}));
</script>

<template>
  <ActionConfirmModal :payload="payload" @close="emit('close', $event)" />
</template>
