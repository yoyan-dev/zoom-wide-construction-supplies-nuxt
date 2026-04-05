<script setup lang="ts">
import DriverForm, { type DriverSubmitValue } from "../DriverForm.vue";
import { useAdminResponseToast } from "~/composables/admin/useAdminResponseToast";

const emit = defineEmits<{ close: [boolean] }>();

const driverStore = useDriverStore();
const { notifyResponse } = useAdminResponseToast();
const isSaving = ref(false);

const handleSave = async (payload: DriverSubmitValue) => {
  isSaving.value = true;
  const response = await driverStore.addDriver({
    email: payload.email,
    password: payload.password ?? "",
    name: payload.name,
    phone: payload.phone ?? null,
    license_number: payload.license_number ?? null,
    vehicle_number: payload.vehicle_number ?? null,
  });
  isSaving.value = false;

  if (
    !notifyResponse(response, {
      successTitle: "Driver created",
      successDescription: `Added ${payload.name}.`,
      errorTitle: "Driver not created",
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
          New Driver
        </p>
        <h3 class="mt-2 text-lg font-semibold">Create driver account</h3>
      </div>
    </template>
    <template #body>
      <DriverForm
        :driver="null"
        submit-label="Create Driver"
        :require-password="true"
        :is-submitting="isSaving"
        @submit="handleSave"
        @cancel="emit('close', false)"
      />
    </template>
  </UModal>
</template>
