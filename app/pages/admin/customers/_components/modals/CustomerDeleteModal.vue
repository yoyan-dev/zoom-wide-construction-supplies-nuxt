<script setup lang="ts">
import type { Customer, CustomerType } from "~/types/customer";
import ActionConfirmModal from "~/pages/admin/_components/modals/ActionConfirmModal.vue";
import { useAdminDeleteFeedback } from "~/composables/admin/useAdminDeleteFeedback";
import { getCustomerTypeLabel } from "../customer-options";

const props = defineProps<{
  payload:
    | {
        customer: Customer | null;
        customerType?: CustomerType;
      }
    | Customer
    | null;
}>();

const emit = defineEmits<{ close: [boolean] }>();

const customerStore = useCustomerStore();
const { getSingleDeleteDescription, handleSingleDelete } =
  useAdminDeleteFeedback();

const customerRecord = computed<Customer | null>(() => {
  if (!props.payload) {
    return null;
  }

  return "customer" in props.payload ? props.payload.customer : props.payload;
});

const customerType = computed<CustomerType>(() => {
  if (!props.payload) {
    return "customer";
  }

  if ("customerType" in props.payload && props.payload.customerType) {
    return props.payload.customerType;
  }

  return customerRecord.value?.customer_type === "contractor"
    ? "contractor"
    : "customer";
});

const payload = computed(() => ({
  eyebrow: `Delete ${getCustomerTypeLabel(customerType.value)}`,
  title: customerRecord.value?.company_name ?? getCustomerTypeLabel(customerType.value),
  description: getSingleDeleteDescription(getCustomerTypeLabel(customerType.value)),
  confirmLabel: "Delete",
  confirmColor: "error" as const,
  onConfirm: async () => {
    if (!customerRecord.value?.id) {
      return false;
    }

    return handleSingleDelete(
      await customerStore.deleteCustomer(customerRecord.value.id),
      {
        resourceLabel: getCustomerTypeLabel(customerType.value),
        subject:
          customerRecord.value.company_name ??
          `the ${getCustomerTypeLabel(customerType.value).toLowerCase()}`,
      },
    );
  },
}));
</script>

<template>
  <ActionConfirmModal :payload="payload" @close="emit('close', $event)" />
</template>
