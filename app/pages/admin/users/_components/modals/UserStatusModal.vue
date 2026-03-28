<script setup lang="ts">
import ActionConfirmModal from "~/pages/admin/_components/modals/ActionConfirmModal.vue";
import { useAdminResponseToast } from "~/composables/admin/useAdminResponseToast";
import type { User } from "~/types/user";

const props = defineProps<{
  payload: User | null;
}>();

const userStore = useUserStore();
const { notifyResponse } = useAdminResponseToast();
const emit = defineEmits<{ close: [boolean] }>();

const isDeactivating = computed(() => props.payload?.is_active ?? false);

const payload = computed(() => ({
  eyebrow: isDeactivating.value ? "Deactivate User" : "Activate User",
  title: props.payload?.full_name ?? "Internal user",
  description: isDeactivating.value
    ? "This account will no longer be able to sign in until it is reactivated."
    : "This account will be restored as an active internal sign-in.",
  confirmLabel: isDeactivating.value ? "Deactivate" : "Activate",
  confirmColor: (isDeactivating.value ? "warning" : "success") as const,
  onConfirm: async () => {
    if (!props.payload?.id) {
      return false;
    }

    return notifyResponse(
      await userStore.updateUser(props.payload.id, {
        is_active: !props.payload.is_active,
      }),
      {
        successTitle: isDeactivating.value ? "User deactivated" : "User activated",
        successDescription: `${props.payload.full_name} is now ${isDeactivating.value ? "inactive" : "active"}.`,
        errorTitle: isDeactivating.value
          ? "User not deactivated"
          : "User not activated",
      },
    );
  },
}));
</script>

<template>
  <ActionConfirmModal :payload="payload" @close="emit('close', $event)" />
</template>
