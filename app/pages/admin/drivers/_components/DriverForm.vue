<script setup lang="ts">
import type { Driver } from "~/types/driver";

export type DriverSubmitValue = {
  email: string;
  password?: string;
  name: string;
  phone?: string;
  license_number?: string;
  vehicle_number?: string;
  is_active?: boolean;
};

const props = defineProps<{
  driver: Driver | null;
  submitLabel: string;
  cancelLabel?: string;
  showStatusField?: boolean;
  requirePassword?: boolean;
  isSubmitting?: boolean;
}>();

const emit = defineEmits<{
  (e: "submit", value: DriverSubmitValue): void;
  (e: "cancel"): void;
}>();

const draft = reactive({
  email: "",
  password: "",
  name: "",
  phone: "",
  license_number: "",
  vehicle_number: "",
  is_active: true,
});

const formError = ref<string | null>(null);

const normalize = (value: string) => {
  const trimmed = value.trim();
  return trimmed.length ? trimmed : undefined;
};

watch(
  () => props.driver,
  (value) => {
    draft.email = value?.email ?? "";
    draft.password = "";
    draft.name = value?.name ?? "";
    draft.phone = value?.phone ?? "";
    draft.license_number = value?.license_number ?? "";
    draft.vehicle_number = value?.vehicle_number ?? "";
    draft.is_active = value?.is_active !== false;
    formError.value = null;
  },
  { immediate: true },
);

const canSubmit = computed(() => {
  if (!draft.email.trim() || !draft.name.trim()) {
    return false;
  }

  if (props.requirePassword && !draft.password.trim()) {
    return false;
  }

  return !props.isSubmitting;
});

const handleSubmit = () => {
  formError.value = null;

  if (!draft.email.trim() || !draft.name.trim()) {
    formError.value = "Email and driver name are required.";
    return;
  }

  if (props.requirePassword && !draft.password.trim()) {
    formError.value = "Password is required when creating a driver account.";
    return;
  }

  emit("submit", {
    email: draft.email.trim(),
    password: normalize(draft.password),
    name: draft.name.trim(),
    phone: normalize(draft.phone),
    license_number: normalize(draft.license_number),
    vehicle_number: normalize(draft.vehicle_number),
    is_active: props.showStatusField ? draft.is_active : undefined,
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
      <UFormField label="Driver name" required>
        <UInput
          v-model="draft.name"
          class="w-full"
          placeholder="Driver name"
        />
      </UFormField>

      <UFormField label="Email address" required>
        <UInput
          v-model="draft.email"
          type="email"
          class="w-full"
          placeholder="driver@zoom.local"
          autocomplete="email"
        />
      </UFormField>
    </div>

    <div class="grid gap-5 md:grid-cols-2">
      <UFormField label="Phone number">
        <UInput
          v-model="draft.phone"
          class="w-full"
          placeholder="+63 900 000 0000"
          autocomplete="tel"
        />
      </UFormField>

      <UFormField
        :label="props.requirePassword ? 'Temporary password' : 'Reset password'"
        :description="
          props.requirePassword
            ? 'Required when creating a new driver account.'
            : 'Leave blank to keep the current password.'
        "
        :required="props.requirePassword"
      >
        <UInput
          v-model="draft.password"
          type="password"
          class="w-full"
          :placeholder="
            props.requirePassword ? 'Create a password' : 'Optional new password'
          "
          autocomplete="new-password"
        />
      </UFormField>
    </div>

    <div class="grid gap-5 md:grid-cols-2">
      <UFormField label="License number">
        <UInput
          v-model="draft.license_number"
          class="w-full"
          placeholder="License number"
        />
      </UFormField>

      <UFormField label="Vehicle number">
        <UInput
          v-model="draft.vehicle_number"
          class="w-full"
          placeholder="Vehicle number"
        />
      </UFormField>
    </div>

    <div
      v-if="props.showStatusField"
      class="flex items-center justify-between rounded-lg border border-slate-200/70 p-4"
    >
      <div>
        <p class="text-sm font-medium">Driver account active</p>
        <p class="text-xs text-slate-500">
          Toggle whether this driver account can still sign in.
        </p>
      </div>
      <USwitch v-model="draft.is_active" />
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
