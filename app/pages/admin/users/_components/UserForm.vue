<script setup lang="ts">
import type {
  CreateUserPayload,
  InternalUserRole,
  UpdateUserPayload,
  User,
} from "~/types/user";
import { INTERNAL_USER_ROLE_OPTIONS } from "./internal-user-options";

export type UserSubmitValue = {
  email: string;
  password?: string;
  full_name: string;
  phone?: string;
  role: InternalUserRole;
  is_active?: boolean;
};

const props = defineProps<{
  user: User | null;
  submitLabel: string;
  cancelLabel?: string;
  showStatusField?: boolean;
  requirePassword?: boolean;
  isSubmitting?: boolean;
}>();

const emit = defineEmits<{
  (e: "submit", value: UserSubmitValue): void;
  (e: "cancel"): void;
}>();

const draft = reactive({
  email: "",
  password: "",
  full_name: "",
  phone: "",
  role: "staff" as InternalUserRole,
  is_active: true,
});

const formError = ref<string | null>(null);

const normalize = (value: string) => {
  const trimmed = value.trim();
  return trimmed.length ? trimmed : undefined;
};

watch(
  () => props.user,
  (value) => {
    draft.email = value?.email ?? "";
    draft.password = "";
    draft.full_name = value?.full_name ?? "";
    draft.phone = value?.phone ?? "";
    draft.role = (value?.role as InternalUserRole | undefined) ?? "staff";
    draft.is_active = value?.is_active ?? true;
    formError.value = null;
  },
  { immediate: true },
);

const canSubmit = computed(() => {
  if (!draft.email.trim() || !draft.full_name.trim()) {
    return false;
  }

  if (props.requirePassword && !draft.password.trim()) {
    return false;
  }

  return !props.isSubmitting;
});

const handleSubmit = () => {
  formError.value = null;

  if (!draft.email.trim() || !draft.full_name.trim()) {
    formError.value = "Email and full name are required.";
    return;
  }

  if (props.requirePassword && !draft.password.trim()) {
    formError.value = "Password is required when creating an internal user.";
    return;
  }

  emit("submit", {
    email: draft.email.trim(),
    password: normalize(draft.password),
    full_name: draft.full_name.trim(),
    phone: normalize(draft.phone),
    role: draft.role,
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
      <UFormField label="Full name" required>
        <UInput
          v-model="draft.full_name"
          class="w-full"
          placeholder="Full name"
        />
      </UFormField>

      <UFormField label="Role" required>
        <USelect
          v-model="draft.role"
          class="w-full"
          :items="INTERNAL_USER_ROLE_OPTIONS"
          placeholder="Select role"
        />
      </UFormField>
    </div>

    <div class="grid gap-5 md:grid-cols-2">
      <UFormField label="Email address" required>
        <UInput
          v-model="draft.email"
          type="email"
          class="w-full"
          placeholder="user@zoom.local"
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
          ? 'Required when creating a new internal account.'
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

    <div
      v-if="props.showStatusField"
      class="flex items-center justify-between rounded-2xl border border-slate-200/70 p-4"
    >
      <div>
        <p class="text-sm font-medium">Account active</p>
        <p class="text-xs text-slate-500">
          Toggle whether this internal account can still sign in.
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
