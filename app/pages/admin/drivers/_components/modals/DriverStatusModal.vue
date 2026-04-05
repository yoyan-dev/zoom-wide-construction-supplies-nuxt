<script setup lang="ts">
import type { Driver } from "~/types/driver";
import ActionConfirmModal from "~/pages/admin/_components/modals/ActionConfirmModal.vue";
import { useAdminResponseToast } from "~/composables/admin/useAdminResponseToast";

const props = defineProps<{
  payload: Driver | null;
}>();

const driverStore = useDriverStore();
const { notifyResponse } = useAdminResponseToast();
const emit = defineEmits<{ close: [boolean] }>();

const isDeactivating = computed(() => props.payload?.is_active !== false);

const payload = computed(() => ({
  eyebrow: isDeactivating.value ? "Deactivate Driver" : "Activate Driver",
  title: props.payload?.name ?? "Driver",
  description: isDeactivating.value
    ? "This driver will no longer be able to sign in until the account is reactivated."
    : "This driver account will be restored as an active delivery sign-in.",
  confirmLabel: isDeactivating.value ? "Deactivate" : "Activate",
  confirmColor: (isDeactivating.value ? "warning" : "success") as const,
  onConfirm: async () => {
    if (!props.payload?.id) {
      return false;
    }

    return notifyResponse(
      await driverStore.updateDriver(props.payload.id, {
        is_active: !(props.payload.is_active !== false),
      }),
      {
        successTitle: isDeactivating.value
          ? "Driver deactivated"
          : "Driver activated",
        successDescription: `${props.payload.name} is now ${isDeactivating.value ? "inactive" : "active"}.`,
        errorTitle: isDeactivating.value
          ? "Driver not deactivated"
          : "Driver not activated",
      },
    );
  },
}));
</script>

<template>
  <ActionConfirmModal :payload="payload" @close="emit('close', $event)" />
</template>
