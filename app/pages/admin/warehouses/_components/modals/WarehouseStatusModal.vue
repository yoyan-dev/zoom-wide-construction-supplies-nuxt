<script setup lang="ts">
import type { Warehouse } from "~/types/warehouse";
import ActionConfirmModal from "~/pages/admin/_components/modals/ActionConfirmModal.vue";
import { useAdminResponseToast } from "~/composables/admin/useAdminResponseToast";

const props = defineProps<{
  payload: Warehouse | null;
}>();

const warehouseStore = useWarehouseStore();
const { notifyResponse } = useAdminResponseToast();
const emit = defineEmits<{ close: [boolean] }>();

const isDeactivating = computed(() => props.payload?.status === "active");

const payload = computed(() => ({
  eyebrow: isDeactivating.value ? "Deactivate Warehouse" : "Activate Warehouse",
  title: props.payload?.name ?? "Warehouse",
  description: isDeactivating.value
    ? "This warehouse will remain in records but will no longer appear as an active stock location."
    : "This warehouse will be restored as an active stock location.",
  confirmLabel: isDeactivating.value ? "Deactivate" : "Activate",
  confirmColor: (isDeactivating.value ? "warning" : "success") as const,
  onConfirm: async () => {
    if (!props.payload?.id) {
      return false;
    }

    return notifyResponse(
      await warehouseStore.updateWarehouse(props.payload.id, {
        status: isDeactivating.value ? "inactive" : "active",
      }),
      {
        successTitle: isDeactivating.value
          ? "Warehouse deactivated"
          : "Warehouse activated",
        successDescription: `${props.payload.name} is now ${isDeactivating.value ? "inactive" : "active"}.`,
        errorTitle: isDeactivating.value
          ? "Warehouse not deactivated"
          : "Warehouse not activated",
      },
    );
  },
}));
</script>

<template>
  <ActionConfirmModal :payload="payload" @close="emit('close', $event)" />
</template>
