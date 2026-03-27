<script setup lang="ts">
import type { Customer } from "~/types/customer";
import CustomerForm, {
  type CustomerSubmitValue,
} from "../CustomerForm.vue";
import { useAdminResponseToast } from "~/composables/admin/useAdminResponseToast";

const props = defineProps<{
  payload: Customer | null;
}>();

const emit = defineEmits<{ close: [boolean] }>();

const customerStore = useCustomerStore();
const { notifyResponse } = useAdminResponseToast();
const isSaving = ref(false);

const customerId = computed(() => props.payload?.id ?? "");

const handleSave = async (payload: CustomerSubmitValue) => {
  if (!customerId.value) {
    return;
  }

  isSaving.value = true;
  const response = await customerStore.updateCustomer(customerId.value, payload);
  isSaving.value = false;

  if (
    !notifyResponse(response, {
      successTitle: "Customer updated",
      successDescription: `Saved changes to ${payload.company_name}.`,
      errorTitle: "Customer not updated",
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
          Edit Customer
        </p>
        <h3 class="mt-2 text-lg font-semibold">Update customer details</h3>
      </div>
    </template>
    <template #body>
      <CustomerForm
        :customer="props.payload"
        submit-label="Save Changes"
        :is-submitting="isSaving"
        @submit="handleSave"
        @cancel="emit('close', false)"
      />
    </template>
  </UModal>
</template>
