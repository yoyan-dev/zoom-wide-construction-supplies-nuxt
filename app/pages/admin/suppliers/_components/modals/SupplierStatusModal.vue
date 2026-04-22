<script setup lang="ts">
import type { Supplier } from "~/types/supplier";
import ActionConfirmModal from "~/pages/admin/_components/modals/ActionConfirmModal.vue";
import { useAdminResponseToast } from "~/composables/admin/useAdminResponseToast";

const props = defineProps<{
  payload: Supplier | null;
}>();

const supplierStore = useSupplierStore();
const { notifyResponse } = useAdminResponseToast();
const emit = defineEmits<{ close: [boolean] }>();

const isDeactivating = computed(() => props.payload?.is_active !== false);

const payload = computed(() => ({
  eyebrow: isDeactivating.value ? "Deactivate Supplier" : "Activate Supplier",
  title: props.payload?.business_name ?? "Supplier",
  description: isDeactivating.value
    ? "This supplier account will no longer be able to sign in until it is reactivated."
    : "This supplier account will be restored as an active supplier sign-in.",
  confirmLabel: isDeactivating.value ? "Deactivate" : "Activate",
  confirmColor: (isDeactivating.value ? "warning" : "success") as const,
  onConfirm: async () => {
    if (!props.payload?.id) {
      return false;
    }

    return notifyResponse(
      await supplierStore.updateSupplier(props.payload.id, {
        is_active: !(props.payload.is_active !== false),
      }),
      {
        successTitle: isDeactivating.value
          ? "Supplier deactivated"
          : "Supplier activated",
        successDescription: `${props.payload.business_name} is now ${isDeactivating.value ? "inactive" : "active"}.`,
        errorTitle: isDeactivating.value
          ? "Supplier not deactivated"
          : "Supplier not activated",
      },
    );
  },
}));
</script>

<template>
  <ActionConfirmModal :payload="payload" @close="emit('close', $event)" />
</template>
