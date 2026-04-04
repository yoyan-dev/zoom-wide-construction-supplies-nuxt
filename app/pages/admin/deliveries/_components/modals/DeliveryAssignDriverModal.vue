<script setup lang="ts">
import type { Delivery, UpdateDeliveryPayload } from "~/types/delivery";
import type { Driver } from "~/types/driver";
import { useAdminResponseToast } from "~/composables/admin/useAdminResponseToast";

type DeliveryAssignDriverModalPayload = {
  delivery: Delivery;
  drivers: Driver[];
};

const props = defineProps<{
  payload: DeliveryAssignDriverModalPayload | null;
}>();

const emit = defineEmits<{ close: [boolean] }>();

const deliveryStore = useDeliveryStore();
const { notifyResponse } = useAdminResponseToast();
const isSaving = ref(false);

const draft = reactive({
  driver_id: "",
  vehicle_number: "",
});

const previousDriverId = ref("");

watch(
  () => props.payload?.delivery,
  (delivery) => {
    draft.driver_id = delivery?.driver_id ?? "";
    draft.vehicle_number = delivery?.vehicle_number ?? "";
    previousDriverId.value = delivery?.driver_id ?? "";
  },
  { immediate: true },
);

const availableDrivers = computed(() =>
  (props.payload?.drivers ?? []).filter((driver) => driver.is_active ?? true),
);

const driverOptions = computed(() => {
  const options = availableDrivers.value.map((driver) => ({
    label: `${driver.name}${driver.vehicle_number ? ` - ${driver.vehicle_number}` : ""}`,
    value: driver.id,
  }));

  const currentDriverId = props.payload?.delivery.driver_id;
  if (currentDriverId && !options.some((option) => option.value === currentDriverId)) {
    options.unshift({
      label: `Current driver (${currentDriverId})`,
      value: currentDriverId,
    });
  }

  return [{ label: "Unassigned", value: "" }, ...options];
});

const selectedDriver = computed(() =>
  (props.payload?.drivers ?? []).find((driver) => driver.id === draft.driver_id) ?? null,
);

watch(
  () => draft.driver_id,
  (nextDriverId) => {
    const previousVehicle =
      availableDrivers.value.find((driver) => driver.id === previousDriverId.value)
        ?.vehicle_number ?? "";
    const nextVehicle = selectedDriver.value?.vehicle_number ?? "";

    if (!nextDriverId) {
      if (!draft.vehicle_number.trim() || draft.vehicle_number === previousVehicle) {
        draft.vehicle_number = "";
      }
      previousDriverId.value = "";
      return;
    }

    if (!draft.vehicle_number.trim() || draft.vehicle_number === previousVehicle) {
      draft.vehicle_number = nextVehicle;
    }

    previousDriverId.value = nextDriverId;
  },
);

const assignmentSummary = computed(() => {
  if (selectedDriver.value?.name && draft.vehicle_number.trim()) {
    return `This delivery will be assigned to ${selectedDriver.value.name} using vehicle ${draft.vehicle_number.trim()}.`;
  }

  if (selectedDriver.value?.name) {
    return `This delivery will be assigned to ${selectedDriver.value.name}.`;
  }

  return "Choose a driver to assign this delivery, or leave it unassigned.";
});

const handleSave = async () => {
  const deliveryId = props.payload?.delivery.id;

  if (!deliveryId || isSaving.value) {
    return;
  }

  isSaving.value = true;

  const response = await deliveryStore.updateDelivery(deliveryId, {
    driver_id: draft.driver_id.trim() || null,
    vehicle_number: draft.vehicle_number.trim() || null,
  } satisfies UpdateDeliveryPayload);

  isSaving.value = false;

  if (
    !notifyResponse(response, {
      successTitle: draft.driver_id ? "Driver assigned" : "Driver unassigned",
      successDescription: draft.driver_id
        ? "The delivery assignment has been updated."
        : "The delivery no longer has a driver assignment.",
      errorTitle: "Assignment not updated",
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
          Driver Assignment
        </p>
        <h3 class="mt-2 text-lg font-semibold">
          {{
            props.payload?.delivery.id
              ? `Assign driver for delivery ${props.payload.delivery.id}`
              : "Assign driver"
          }}
        </h3>
        <p class="mt-1 text-sm text-slate-600">
          {{ assignmentSummary }}
        </p>
      </div>
    </template>

    <template #body>
      <div class="space-y-4">
        <UFormField label="Driver">
          <USelect
            v-model="draft.driver_id"
            class="w-full"
            :items="driverOptions"
            placeholder="Select driver"
          />
        </UFormField>

        <UFormField label="Vehicle number">
          <UInput
            v-model="draft.vehicle_number"
            class="w-full"
            placeholder="Enter vehicle number"
          />
        </UFormField>
      </div>
    </template>

    <template #footer>
      <div class="flex w-full items-center justify-end gap-2">
        <UButton
          color="neutral"
          variant="ghost"
          @click="emit('close', false)"
        >
          Cancel
        </UButton>
        <UButton
          color="primary"
          icon="i-lucide-user-round-check"
          :loading="isSaving"
          @click="handleSave"
        >
          Save Assignment
        </UButton>
      </div>
    </template>
  </UModal>
</template>
