<script setup lang="ts">
import type { Customer } from "~/types/customer";
import ActionConfirmModal from "~/pages/admin/_components/modals/ActionConfirmModal.vue";
import { useAdminDeleteFeedback } from "~/composables/admin/useAdminDeleteFeedback";

const props = defineProps<{
  payload: Customer | null;
}>();

const emit = defineEmits<{ close: [boolean] }>();

const customerStore = useCustomerStore();
const { getSingleDeleteDescription, handleSingleDelete } =
  useAdminDeleteFeedback();

const payload = computed(() => ({
  eyebrow: "Delete Customer",
  title: props.payload?.company_name ?? "Customer",
  description: getSingleDeleteDescription("Customer"),
  confirmLabel: "Delete",
  confirmColor: "error" as const,
  onConfirm: async () => {
    if (!props.payload?.id) {
      return false;
    }

    return handleSingleDelete(
      await customerStore.deleteCustomer(props.payload.id),
      {
        resourceLabel: "Customer",
        subject: props.payload.company_name ?? "the customer",
      },
    );
  },
}));
</script>

<template>
  <ActionConfirmModal :payload="payload" @close="emit('close', $event)" />
</template>
