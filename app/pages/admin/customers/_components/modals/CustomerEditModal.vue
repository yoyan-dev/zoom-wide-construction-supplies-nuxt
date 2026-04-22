<script setup lang="ts">
import type { Customer, CustomerType } from "~/types/customer";
import CustomerForm, {
  type CustomerSubmitValue,
} from "../CustomerForm.vue";
import { getCustomerTypeLabel } from "../customer-options";
import { useAdminResponseToast } from "~/composables/admin/useAdminResponseToast";

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
const { notifyResponse } = useAdminResponseToast();
const isSaving = ref(false);

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

const customerId = computed(() => customerRecord.value?.id ?? "");

const handleSave = async (payload: CustomerSubmitValue) => {
  if (!customerId.value) {
    return;
  }

  isSaving.value = true;
  const response = await customerStore.updateCustomer(customerId.value, payload);
  isSaving.value = false;

  if (
    !notifyResponse(response, {
      successTitle: `${getCustomerTypeLabel(customerType.value)} updated`,
      successDescription: `Saved changes to ${payload.company_name}.`,
      errorTitle: `${getCustomerTypeLabel(customerType.value)} not updated`,
    })
  ) {
    return;
  }

  emit("close", false);
};
</script>

<template>
  <UModal :close="{ onClick: () => emit('close', false) }">
    <template #header>
      <div>
        <p class="text-xs uppercase tracking-[0.18em] text-slate-500">
          Edit {{ getCustomerTypeLabel(customerType) }}
        </p>
        <h3 class="mt-2 text-lg font-semibold">
          Update {{ getCustomerTypeLabel(customerType).toLowerCase() }} details
        </h3>
      </div>
    </template>
    <template #body>
      <CustomerForm
        :customer="customerRecord"
        submit-label="Save Changes"
        :is-submitting="isSaving"
        @submit="handleSave"
        @cancel="emit('close', false)"
      />
    </template>
  </UModal>
</template>
