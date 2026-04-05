<script setup lang="ts">
import type { Driver } from "~/types/driver";
import DriverForm, { type DriverSubmitValue } from "../DriverForm.vue";
import { useAdminResponseToast } from "~/composables/admin/useAdminResponseToast";

const props = defineProps<{
  payload: Driver | null;
}>();

const emit = defineEmits<{ close: [boolean] }>();

const driverStore = useDriverStore();
const { notifyResponse } = useAdminResponseToast();
const isSaving = ref(false);

const driverId = computed(() => props.payload?.id ?? "");

const handleSave = async (payload: DriverSubmitValue) => {
  if (!driverId.value) {
    return;
  }

  isSaving.value = true;
  const response = await driverStore.updateDriver(driverId.value, {
    email: payload.email,
    password: payload.password ?? null,
    name: payload.name,
    phone: payload.phone ?? null,
    license_number: payload.license_number ?? null,
    vehicle_number: payload.vehicle_number ?? null,
    is_active: payload.is_active,
  });
  isSaving.value = false;

  if (
    !notifyResponse(response, {
      successTitle: "Driver updated",
      successDescription: `Saved changes to ${payload.name}.`,
      errorTitle: "Driver not updated",
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
          Edit Driver
        </p>
        <h3 class="mt-2 text-lg font-semibold">Update driver details</h3>
      </div>
    </template>
    <template #body>
      <DriverForm
        :driver="props.payload"
        submit-label="Save Changes"
        :show-status-field="true"
        :is-submitting="isSaving"
        @submit="handleSave"
        @cancel="emit('close', false)"
      />
    </template>
  </UModal>
</template>
