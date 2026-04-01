<script setup lang="ts">
import type {
  CreateDeliveryPayload,
  Delivery,
  DeliveryStatus,
  UpdateDeliveryPayload,
} from "~/types/delivery";
import type { Driver } from "~/types/driver";
import type { Order } from "~/types/order";

type DeliveryFormMode = "create" | "edit";
type DeliverySubmitValue = CreateDeliveryPayload | UpdateDeliveryPayload;

const props = defineProps<{
  mode: DeliveryFormMode;
  delivery?: Delivery | null;
  orders: Order[];
  drivers: Driver[];
  submitLabel: string;
  cancelLabel?: string;
  isSubmitting?: boolean;
}>();

const emit = defineEmits<{
  (e: "submit", value: DeliverySubmitValue): void;
  (e: "cancel"): void;
}>();

const draft = reactive({
  order_id: "",
  driver_id: "",
  vehicle_number: "",
  status: "scheduled" as DeliveryStatus,
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
  () => [props.mode, props.delivery],
  () => {
    draft.order_id = props.delivery?.order_id ?? "";
    draft.driver_id = props.delivery?.driver_id ?? "";
    draft.vehicle_number = props.delivery?.vehicle_number ?? "";
    draft.status = props.delivery?.status ?? "scheduled";
    draft.scheduled_at = toDateTimeLocal(props.delivery?.scheduled_at);
    draft.delivered_at = toDateTimeLocal(props.delivery?.delivered_at);
  },
  { immediate: true },
);

const orderOptions = computed(() =>
  props.orders.map((order) => ({
    label: `Order ${order.id}`,
    value: order.id,
  })),
);

const driverOptions = computed(() => [
  { label: "Unassigned", value: "" },
  ...props.drivers.map((driver) => ({
    label: `${driver.name}${driver.vehicle_number ? ` - ${driver.vehicle_number}` : ""}`,
    value: driver.id,
  })),
]);

const statusOptions = [
  { label: "Scheduled", value: "scheduled" },
  { label: "In transit", value: "in_transit" },
  { label: "Delivered", value: "delivered" },
  { label: "Failed", value: "failed" },
  { label: "Cancelled", value: "cancelled" },
];

const isSubmitDisabled = computed(
  () => props.mode === "create" && !draft.order_id.trim(),
);

const handleSubmit = () => {
  if (isSubmitDisabled.value) {
    return;
  }

  const sharedPayload = {
    driver_id: draft.driver_id.trim() || null,
    vehicle_number: draft.vehicle_number.trim() || null,
    status: draft.status,
    scheduled_at: normalizeDateValue(draft.scheduled_at),
    delivered_at: normalizeDateValue(draft.delivered_at),
  };

  if (props.mode === "create") {
    emit("submit", {
      order_id: draft.order_id.trim(),
      ...sharedPayload,
    } satisfies CreateDeliveryPayload);
    return;
  }

  emit("submit", sharedPayload satisfies UpdateDeliveryPayload);
};
</script>

<template>
  <UForm @submit.prevent="handleSubmit">
    <div class="space-y-4">
      <UFormField v-if="props.mode === 'create'" label="Order">
        <USelect
          v-model="draft.order_id"
          :items="orderOptions"
          placeholder="Select order"
        />
      </UFormField>

      <div class="grid gap-4 md:grid-cols-2">
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
            class="w-full"
            placeholder="Enter vehicle number"
          />
        </UFormField>
      </div>

      <div class="grid gap-4 md:grid-cols-2">
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
            class="w-full"
            type="datetime-local"
          />
        </UFormField>
      </div>
    </div>

    <div class="mt-6 flex items-center justify-end gap-2">
      <UButton
        color="neutral"
        variant="ghost"
        type="button"
        @click="emit('cancel')"
      >
        {{ props.cancelLabel ?? "Cancel" }}
      </UButton>
      <UButton
        color="primary"
        type="submit"
        :disabled="isSubmitDisabled"
        :loading="props.isSubmitting"
      >
        {{ props.submitLabel }}
      </UButton>
    </div>
  </UForm>
</template>
