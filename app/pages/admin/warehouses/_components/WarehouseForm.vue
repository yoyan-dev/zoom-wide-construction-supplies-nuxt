<script setup lang="ts">
import type { Warehouse, WarehouseStatus } from "~/types/warehouse";
import { WAREHOUSE_FORM_STATUS_OPTIONS } from "./warehouse-options";

export type WarehouseSubmitValue = {
  name: string;
  address: string;
  manager_id?: string | null;
  capacity: number;
  status: WarehouseStatus;
};

const props = defineProps<{
  warehouse: Warehouse | null;
  submitLabel: string;
  cancelLabel?: string;
  isSubmitting?: boolean;
}>();

const emit = defineEmits<{
  (e: "submit", value: WarehouseSubmitValue): void;
  (e: "cancel"): void;
}>();

const draft = reactive({
  name: "",
  address: "",
  manager_id: "",
  capacity: "",
  status: "active" as WarehouseStatus,
});

const formError = ref<string | null>(null);

const normalize = (value: string) => {
  const trimmed = value.trim();
  return trimmed.length ? trimmed : null;
};

watch(
  () => props.warehouse,
  (value) => {
    draft.name = value?.name ?? "";
    draft.address = value?.address ?? "";
    draft.manager_id = value?.manager_id ?? "";
    draft.capacity =
      value?.capacity === undefined || value?.capacity === null
        ? ""
        : String(value.capacity);
    draft.status = value?.status ?? "active";
    formError.value = null;
  },
  { immediate: true },
);

const capacityValue = computed(() => Number(draft.capacity));

const canSubmit = computed(
  () =>
    Boolean(draft.name.trim()) &&
    Boolean(draft.address.trim()) &&
    Number.isFinite(capacityValue.value) &&
    capacityValue.value >= 0 &&
    !props.isSubmitting,
);

const handleSubmit = () => {
  formError.value = null;

  if (!draft.name.trim() || !draft.address.trim()) {
    formError.value = "Warehouse name and address are required.";
    return;
  }

  if (!Number.isFinite(capacityValue.value) || capacityValue.value < 0) {
    formError.value = "Capacity must be zero or greater.";
    return;
  }

  emit("submit", {
    name: draft.name.trim(),
    address: draft.address.trim(),
    manager_id: normalize(draft.manager_id),
    capacity: capacityValue.value,
    status: draft.status,
  });
};
</script>

<template>
  <UForm class="space-y-5" @submit.prevent="handleSubmit">
    <UAlert
      v-if="formError"
      color="error"
      variant="soft"
      icon="i-lucide-circle-alert"
      :title="formError"
    />

    <div class="grid gap-5 md:grid-cols-2">
      <UFormField label="Warehouse name" required>
        <UInput
          v-model="draft.name"
          class="w-full"
          placeholder="Central Warehouse"
        />
      </UFormField>

      <UFormField label="Status" required>
        <USelect
          v-model="draft.status"
          class="w-full"
          :items="WAREHOUSE_FORM_STATUS_OPTIONS"
          placeholder="Select status"
        />
      </UFormField>
    </div>

    <UFormField label="Address" required>
      <UTextarea
        v-model="draft.address"
        class="w-full"
        :rows="3"
        placeholder="Warehouse address"
      />
    </UFormField>

    <div class="grid gap-5 md:grid-cols-2">
      <UFormField label="Capacity" required>
        <UInput
          v-model="draft.capacity"
          type="number"
          min="0"
          class="w-full"
          placeholder="0"
        />
      </UFormField>

      <UFormField
        label="Manager ID"
        description="Optional internal user id assigned to this warehouse."
      >
        <UInput
          v-model="draft.manager_id"
          class="w-full"
          placeholder="Optional manager id"
        />
      </UFormField>
    </div>

    <div class="flex justify-end gap-2">
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
        :disabled="!canSubmit"
        :loading="props.isSubmitting"
      >
        {{ props.submitLabel }}
      </UButton>
    </div>
  </UForm>
</template>
