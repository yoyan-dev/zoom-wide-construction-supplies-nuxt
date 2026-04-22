<script setup lang="ts">
import type { Supplier } from "~/types/supplier";

export type SupplierSubmitValue = {
  email: string;
  password?: string;
  business_name: string;
  contact_person: string;
  phone?: string;
  address?: string;
  is_active?: boolean;
};

const props = defineProps<{
  supplier: Supplier | null;
  submitLabel: string;
  cancelLabel?: string;
  showStatusField?: boolean;
  requirePassword?: boolean;
  isSubmitting?: boolean;
}>();

const emit = defineEmits<{
  (e: "submit", value: SupplierSubmitValue): void;
  (e: "cancel"): void;
}>();

const draft = reactive({
  email: "",
  password: "",
  business_name: "",
  contact_person: "",
  phone: "",
  address: "",
  is_active: true,
});

const formError = ref<string | null>(null);

const normalize = (value: string) => {
  const trimmed = value.trim();
  return trimmed.length ? trimmed : undefined;
};

watch(
  () => props.supplier,
  (value) => {
    draft.email = value?.email ?? "";
    draft.password = "";
    draft.business_name = value?.business_name ?? "";
    draft.contact_person = value?.contact_person ?? "";
    draft.phone = value?.phone ?? "";
    draft.address = value?.address ?? "";
    draft.is_active = value?.is_active !== false;
    formError.value = null;
  },
  { immediate: true },
);

const canSubmit = computed(() => {
  if (
    !draft.email.trim() ||
    !draft.business_name.trim() ||
    !draft.contact_person.trim()
  ) {
    return false;
  }

  if (props.requirePassword && !draft.password.trim()) {
    return false;
  }

  return !props.isSubmitting;
});

const handleSubmit = () => {
  formError.value = null;

  if (
    !draft.email.trim() ||
    !draft.business_name.trim() ||
    !draft.contact_person.trim()
  ) {
    formError.value =
      "Email, business name, and contact person are required.";
    return;
  }

  if (props.requirePassword && !draft.password.trim()) {
    formError.value = "Password is required when creating a supplier account.";
    return;
  }

  emit("submit", {
    email: draft.email.trim(),
    password: normalize(draft.password),
    business_name: draft.business_name.trim(),
    contact_person: draft.contact_person.trim(),
    phone: normalize(draft.phone),
    address: normalize(draft.address),
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
      <UFormField label="Business name" required>
        <UInput
          v-model="draft.business_name"
          class="w-full"
          placeholder="ABC Construction Supply"
        />
      </UFormField>

      <UFormField label="Contact person" required>
        <UInput
          v-model="draft.contact_person"
          class="w-full"
          placeholder="Jane Dela Cruz"
        />
      </UFormField>
    </div>

    <div class="grid gap-5 md:grid-cols-2">
      <UFormField label="Email address" required>
        <UInput
          v-model="draft.email"
          type="email"
          class="w-full"
          placeholder="supplier@zoom.local"
          autocomplete="email"
        />
      </UFormField>

      <UFormField label="Phone number">
        <UInput
          v-model="draft.phone"
          class="w-full"
          placeholder="+63 900 000 0000"
          autocomplete="tel"
        />
      </UFormField>
    </div>

    <UFormField
      :label="props.requirePassword ? 'Temporary password' : 'Reset password'"
      :description="
        props.requirePassword
          ? 'Required when creating a new supplier account.'
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

    <UFormField label="Address">
      <UTextarea
        v-model="draft.address"
        class="w-full"
        :rows="4"
        placeholder="Business or warehouse address"
      />
    </UFormField>

    <div
      v-if="props.showStatusField"
      class="flex items-center justify-between rounded-lg border border-slate-200/70 p-4"
    >
      <div>
        <p class="text-sm font-medium">Supplier account active</p>
        <p class="text-xs text-slate-500">
          Toggle whether this supplier can still sign in.
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
