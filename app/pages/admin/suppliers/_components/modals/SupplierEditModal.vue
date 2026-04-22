<script setup lang="ts">
import type { Supplier } from "~/types/supplier";
import SupplierForm, { type SupplierSubmitValue } from "../SupplierForm.vue";
import { useAdminResponseToast } from "~/composables/admin/useAdminResponseToast";

const props = defineProps<{
  payload: Supplier | null;
}>();

const emit = defineEmits<{ close: [boolean] }>();

const supplierStore = useSupplierStore();
const { notifyResponse } = useAdminResponseToast();
const isSaving = ref(false);

const supplierId = computed(() => props.payload?.id ?? "");

const handleSave = async (payload: SupplierSubmitValue) => {
  if (!supplierId.value) {
    return;
  }

  isSaving.value = true;
  const response = await supplierStore.updateSupplier(supplierId.value, {
    email: payload.email,
    password: payload.password ?? null,
    business_name: payload.business_name,
    contact_person: payload.contact_person,
    phone: payload.phone ?? null,
    address: payload.address ?? null,
    is_active: payload.is_active,
  });
  isSaving.value = false;

  if (
    !notifyResponse(response, {
      successTitle: "Supplier updated",
      successDescription: `Saved changes to ${payload.business_name}.`,
      errorTitle: "Supplier not updated",
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
          Edit Supplier
        </p>
        <h3 class="mt-2 text-lg font-semibold">Update supplier details</h3>
      </div>
    </template>
    <template #body>
      <SupplierForm
        :supplier="props.payload"
        submit-label="Save Changes"
        :show-status-field="true"
        :is-submitting="isSaving"
        @submit="handleSave"
        @cancel="emit('close', false)"
      />
    </template>
  </UModal>
</template>
