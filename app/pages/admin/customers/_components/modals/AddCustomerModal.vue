<script setup lang="ts">
import CustomerForm, {
  type CustomerSubmitValue,
} from "../CustomerForm.vue";
import { getCustomerTypeLabel } from "../customer-options";
import type { CustomerType } from "~/types/customer";
import { useAdminResponseToast } from "~/composables/admin/useAdminResponseToast";

const props = withDefaults(
  defineProps<{
    payload?: {
      customerType?: CustomerType;
    } | null;
  }>(),
  {
    payload: null,
  },
);

const emit = defineEmits<{ close: [boolean] }>();

const customerStore = useCustomerStore();
const { notifyResponse } = useAdminResponseToast();
const isSaving = ref(false);
const customerType = computed<CustomerType>(() =>
  props.payload?.customerType === "contractor" ? "contractor" : "customer",
);

const handleSave = async (payload: CustomerSubmitValue) => {
  isSaving.value = true;
  const response = await customerStore.addCustomer(payload);
  isSaving.value = false;

  if (
    !notifyResponse(response, {
      successTitle: `${getCustomerTypeLabel(customerType.value)} created`,
      successDescription: `Added ${payload.company_name}.`,
      errorTitle: `${getCustomerTypeLabel(customerType.value)} not created`,
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
          New {{ getCustomerTypeLabel(customerType) }}
        </p>
        <h3 class="mt-2 text-lg font-semibold">
          Create {{ getCustomerTypeLabel(customerType).toLowerCase() }} record
        </h3>
      </div>
    </template>
    <template #body>
      <CustomerForm
        :customer="{
          id: '',
          user_id: null,
          customer_type: customerType,
          company_name: '',
          contact_name: '',
          phone: null,
          email: '',
          billing_address: null,
          shipping_address: null,
          created_at: '',
          updated_at: '',
        }"
        :submit-label="`Create ${getCustomerTypeLabel(customerType)}`"
        :is-submitting="isSaving"
        @submit="handleSave"
        @cancel="emit('close', false)"
      />
    </template>
  </UModal>
</template>
