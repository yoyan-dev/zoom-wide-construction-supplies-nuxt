<script setup lang="ts">
import { useAdminResponseToast } from "~/composables/admin/useAdminResponseToast";
import SupplierForm from "../SupplierForm.vue";

defineProps<{ payload?: unknown }>();
const emit = defineEmits<{ close: [boolean] }>();

const supplierStore = useSupplierStore();
const { notifyResponse } = useAdminResponseToast();
const isSaving = ref(false);

type SupplierPayload = {
  name: string;
  contact_name?: string;
  phone?: string;
  email?: string;
  address?: string;
};

const appendIfPresent = (formData: FormData, key: string, value: string) => {
  const trimmed = value.trim();

  if (trimmed) {
    formData.append(key, trimmed);
  }
};

const handleSave = async (payload: SupplierPayload) => {
  const formData = new FormData();
  formData.append("name", payload.name);

  if (payload.contact_name) {
    appendIfPresent(formData, "contact_name", payload.contact_name);
  }

  if (payload.phone) {
    appendIfPresent(formData, "phone", payload.phone);
  }

  if (payload.email) {
    appendIfPresent(formData, "email", payload.email);
  }

  if (payload.address) {
    appendIfPresent(formData, "address", payload.address);
  }

  isSaving.value = true;
  const response = await supplierStore.addSupplier(formData);
  isSaving.value = false;

  if (
    !notifyResponse(response, {
      successTitle: "Supplier created",
      successDescription: `Added ${payload.name}.`,
      errorTitle: "Supplier not created",
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
          New Supplier
        </p>
        <h3 class="mt-2 text-lg font-semibold">Create a supplier</h3>
      </div>
    </template>

    <template #body>
      <SupplierForm
        :supplier="null"
        submit-label="Save"
        :is-submitting="isSaving"
        @submit="handleSave"
        @cancel="emit('close', false)"
      />
    </template>
  </UModal>
</template>
