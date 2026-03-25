<script setup lang="ts">
import { useAdminResponseToast } from "~/composables/admin/useAdminResponseToast";
import SupplierForm from "../SupplierForm.vue";
import type { Supplier } from "~/types/supplier";

const props = defineProps<{
  payload: Supplier | null;
}>();

const emit = defineEmits<{ close: [boolean] }>();

const supplierStore = useSupplierStore();
const { notifyResponse } = useAdminResponseToast();
const isSaving = ref(false);

const supplierId = computed(() => props.payload?.id ?? "");
type SupplierPayload = {
  name: string;
  contact_name?: string;
  phone?: string;
  email?: string;
  address?: string;
};

const handleSave = async (payload: SupplierPayload) => {
  if (!supplierId.value) return;

  isSaving.value = true;
  const response = await supplierStore.updateSupplier(supplierId.value, {
    name: payload.name,
    contact_name: payload.contact_name,
    phone: payload.phone,
    email: payload.email,
    address: payload.address,
  });
  isSaving.value = false;

  if (
    !notifyResponse(response, {
      successTitle: "Supplier updated",
      successDescription: `Saved changes to ${payload.name}.`,
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
        <h3 class="mt-2 text-lg font-semibold">Edit supplier details</h3>
      </div>
    </template>
    <template #body>
      <SupplierForm
        :supplier="props.payload"
        submit-label="Save Changes"
        :is-submitting="isSaving"
        @submit="handleSave"
        @cancel="emit('close', false)"
      />
    </template>
  </UModal>
</template>
