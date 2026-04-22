<script setup lang="ts">
import SupplierForm, { type SupplierSubmitValue } from "../SupplierForm.vue";
import { useAdminResponseToast } from "~/composables/admin/useAdminResponseToast";

const emit = defineEmits<{ close: [boolean] }>();

const supplierStore = useSupplierStore();
const { notifyResponse } = useAdminResponseToast();
const isSaving = ref(false);

const handleSave = async (payload: SupplierSubmitValue) => {
  isSaving.value = true;
  const response = await supplierStore.addSupplier({
    email: payload.email,
    password: payload.password ?? "",
    business_name: payload.business_name,
    contact_person: payload.contact_person,
    phone: payload.phone ?? null,
    address: payload.address ?? null,
  });
  isSaving.value = false;

  if (
    !notifyResponse(response, {
      successTitle: "Supplier created",
      successDescription: `Added ${payload.business_name}.`,
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
        <h3 class="mt-2 text-lg font-semibold">Create supplier account</h3>
      </div>
    </template>
    <template #body>
      <SupplierForm
        :supplier="null"
        submit-label="Create Supplier"
        :require-password="true"
        :is-submitting="isSaving"
        @submit="handleSave"
        @cancel="emit('close', false)"
      />
    </template>
  </UModal>
</template>
