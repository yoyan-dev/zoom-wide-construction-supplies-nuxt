<script setup lang="ts">
import type { Order } from "~/types/order";
import ActionConfirmModal from "~/pages/admin/_components/modals/ActionConfirmModal.vue";
import { useAdminResponseToast } from "~/composables/admin/useAdminResponseToast";

const props = defineProps<{
  payload: Order | null;
}>();

const emit = defineEmits<{ close: [boolean] }>();

const orderStore = useOrderStore();
const { notifyResponse } = useAdminResponseToast();

const payload = computed(() => ({
  eyebrow: "Approve Order",
  title: props.payload?.id ? `Order ${props.payload.id}` : "Order",
  description:
    "This will mark the order as approved and ready for downstream fulfillment work.",
  confirmLabel: "Approve",
  confirmColor: "success" as const,
  onConfirm: async () => {
    if (!props.payload?.id) {
      return false;
    }

    return notifyResponse(await orderStore.approveOrder(props.payload.id), {
      successTitle: "Order approved",
      successDescription: `Order ${props.payload.id} is now approved.`,
      errorTitle: "Order not approved",
    });
  },
}));
</script>

<template>
  <ActionConfirmModal :payload="payload" @close="emit('close', $event)" />
</template>
