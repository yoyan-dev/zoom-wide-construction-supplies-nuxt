<script setup lang="ts">
import CustomerForm, {
  type CustomerSubmitValue,
} from "../CustomerForm.vue";
import { useAdminResponseToast } from "~/composables/admin/useAdminResponseToast";

const emit = defineEmits<{ close: [boolean] }>();

const customerStore = useCustomerStore();
const { notifyResponse } = useAdminResponseToast();
const isSaving = ref(false);

const handleSave = async (payload: CustomerSubmitValue) => {
  isSaving.value = true;
  const response = await customerStore.addCustomer(payload);
  isSaving.value = false;

  if (
    !notifyResponse(response, {
      successTitle: "Customer created",
      successDescription: `Added ${payload.company_name}.`,
      errorTitle: "Customer not created",
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
          New Customer
        </p>
        <h3 class="mt-2 text-lg font-semibold">Create customer record</h3>
      </div>
    </template>
    <template #body>
      <CustomerForm
        :customer="null"
        submit-label="Create Customer"
        :is-submitting="isSaving"
        @submit="handleSave"
        @cancel="emit('close', false)"
      />
    </template>
  </UModal>
</template>
