<script setup lang="ts">
import type { Driver } from "~/types/driver";
import ActionConfirmModal from "~/pages/admin/_components/modals/ActionConfirmModal.vue";
import { useAdminDeleteFeedback } from "~/composables/admin/useAdminDeleteFeedback";

const props = defineProps<{
  payload: Driver | null;
}>();

const driverStore = useDriverStore();
const { getSingleDeleteDescription, handleSingleDelete } =
  useAdminDeleteFeedback();
const emit = defineEmits<{ close: [boolean] }>();

const payload = computed(() => ({
  eyebrow: "Delete Driver",
  title: props.payload?.name ?? "Driver",
  description: getSingleDeleteDescription("Driver"),
  confirmLabel: "Delete",
  confirmColor: "error" as const,
  onConfirm: async () => {
    if (!props.payload?.id) return false;

    return handleSingleDelete(await driverStore.deleteDriver(props.payload.id), {
      resourceLabel: "Driver",
      subject: props.payload.name ?? "the account",
    });
  },
}));
</script>

<template>
  <ActionConfirmModal :payload="payload" @close="emit('close', $event)" />
</template>
