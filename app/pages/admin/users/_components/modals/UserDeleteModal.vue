<script setup lang="ts">
import ActionConfirmModal from "~/pages/admin/_components/modals/ActionConfirmModal.vue";
import { useAdminDeleteFeedback } from "~/composables/admin/useAdminDeleteFeedback";
import type { User } from "~/types/user";

const props = defineProps<{
  payload: User | null;
}>();

const userStore = useUserStore();
const { getSingleDeleteDescription, handleSingleDelete } =
  useAdminDeleteFeedback();
const emit = defineEmits<{ close: [boolean] }>();

const payload = computed(() => ({
  eyebrow: "Delete Internal User",
  title: props.payload?.full_name ?? "Internal user",
  description: getSingleDeleteDescription("Internal user"),
  confirmLabel: "Delete",
  confirmColor: "error" as const,
  onConfirm: async () => {
    if (!props.payload?.id) return false;

    return handleSingleDelete(await userStore.deleteUser(props.payload.id), {
      resourceLabel: "Internal user",
      subject: props.payload.full_name ?? "the account",
    });
  },
}));
</script>

<template>
  <ActionConfirmModal :payload="payload" @close="emit('close', $event)" />
</template>
