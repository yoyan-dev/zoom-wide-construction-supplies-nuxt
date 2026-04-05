<script setup lang="ts">
import type {
  Delivery,
  DeliveryStatus,
  UpdateDeliveryPayload,
} from "~/types/delivery";
import type { Driver } from "~/types/driver";
import { formatLongDate } from "~/utils/format";

type AssignmentDraft = {
  driver_id: string;
  vehicle_number: string;
  status: DeliveryStatus;
  scheduled_at: string;
  delivered_at: string;
};

const props = defineProps<{
  delivery: Delivery;
  drivers: Driver[];
  isSaving: boolean;
}>();

const emit = defineEmits<{
  (e: "save", payload: UpdateDeliveryPayload): void;
}>();

const draft = reactive<AssignmentDraft>({
  driver_id: "",
  vehicle_number: "",
  status: "scheduled",
  scheduled_at: "",
  delivered_at: "",
});

const toDateTimeLocal = (value?: string | null) => {
  if (!value) {
    return "";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  const day = `${date.getDate()}`.padStart(2, "0");
  const hours = `${date.getHours()}`.padStart(2, "0");
  const minutes = `${date.getMinutes()}`.padStart(2, "0");

  return `${year}-${month}-${day}T${hours}:${minutes}`;
};

const normalizeDateValue = (value: string) => {
  const trimmed = value.trim();

  if (!trimmed) {
    return null;
  }

  const date = new Date(trimmed);
  return Number.isNaN(date.getTime()) ? null : date.toISOString();
};

watch(
  () => props.delivery,
  (delivery) => {
    draft.driver_id = delivery.driver_id ?? "";
    draft.vehicle_number = delivery.vehicle_number ?? "";
    draft.status = delivery.status;
    draft.scheduled_at = toDateTimeLocal(delivery.scheduled_at);
    draft.delivered_at = toDateTimeLocal(delivery.delivered_at);
  },
  { immediate: true },
);

const driverOptions = computed(() => {
  const options = props.drivers.map((driver) => ({
    label: `${driver.name}${driver.vehicle_number ? ` - ${driver.vehicle_number}` : ""}`,
    value: driver.id,
  }));

  if (
    props.delivery.driver_id &&
    !options.some((option) => option.value === props.delivery.driver_id)
  ) {
    options.unshift({
      label: `Driver ${props.delivery.driver_id}`,
      value: props.delivery.driver_id,
    });
  }

  return [{ label: "Unassigned", value: "" }, ...options];
});

const resolvedDriverName = computed(() => {
  if (!props.delivery.driver_id) {
    return null;
  }

  return (
    props.drivers.find((driver) => driver.id === props.delivery.driver_id)?.name ??
    props.delivery.driver_id
  );
});

const statusOptions = [
  { label: "Scheduled", value: "scheduled" },
  { label: "In transit", value: "in_transit" },
  { label: "Delivered", value: "delivered" },
  { label: "Failed", value: "failed" },
  { label: "Cancelled", value: "cancelled" },
];

const assignmentSummary = computed(() => {
  if (resolvedDriverName.value && props.delivery.vehicle_number) {
    return `Assigned to ${resolvedDriverName.value} with vehicle ${props.delivery.vehicle_number}.`;
  }

  if (resolvedDriverName.value) {
    return `Assigned to ${resolvedDriverName.value}.`;
  }

  return "No driver is assigned yet.";
});

const handleSave = () => {
  emit("save", {
    driver_id: draft.driver_id.trim() || null,
    vehicle_number: draft.vehicle_number.trim() || null,
    status: draft.status,
    scheduled_at: normalizeDateValue(draft.scheduled_at),
    delivered_at: normalizeDateValue(draft.delivered_at),
  });
};
</script>

<template>
  <UCard>
    <div class="flex flex-wrap items-start justify-between gap-4">
      <div>
        <p class="text-xs uppercase tracking-[0.18em] text-slate-500">
          Assignment & Scheduling
        </p>
        <h2 class="mt-2 text-xl font-semibold text-slate-900">
          Delivery operations
        </h2>
        <p class="mt-2 text-sm text-slate-600">
          {{ assignmentSummary }}
        </p>
      </div>

      <UBadge color="neutral" variant="subtle">
        Updated {{ formatLongDate(props.delivery.updated_at) }}
      </UBadge>
    </div>

    <div class="mt-6 grid gap-4 md:grid-cols-2">
      <UFormField label="Assigned driver">
        <USelect
          v-model="draft.driver_id"
          :items="driverOptions"
          placeholder="Select driver"
        />
      </UFormField>

      <UFormField label="Vehicle number">
        <UInput
          v-model="draft.vehicle_number"
          placeholder="Enter vehicle number"
        />
      </UFormField>

      <UFormField label="Delivery status">
        <USelect
          v-model="draft.status"
          :items="statusOptions"
          placeholder="Select status"
        />
      </UFormField>

      <UFormField label="Scheduled date and time">
        <UInput
          v-model="draft.scheduled_at"
          type="datetime-local"
        />
      </UFormField>

      <UFormField label="Delivered date and time">
        <UInput
          v-model="draft.delivered_at"
          type="datetime-local"
        />
      </UFormField>
    </div>

    <div class="mt-6 flex justify-end">
      <UButton
        color="primary"
        icon="i-lucide-save"
        :loading="props.isSaving"
        @click="handleSave"
      >
        Save Delivery Updates
      </UButton>
    </div>
  </UCard>
</template>
