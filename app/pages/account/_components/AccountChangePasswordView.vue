<script setup lang="ts">
import { storeToRefs } from "pinia";

const accountStore = useAccountStore();
const toast = useToast();
const { isChangingPassword } = storeToRefs(accountStore);

const form = reactive({
  currentPassword: "",
  newPassword: "",
});

const formError = ref<string | null>(null);
const successMessage = ref<string | null>(null);

const canSubmit = computed(
  () =>
    !!form.currentPassword.trim() &&
    !!form.newPassword.trim() &&
    !isChangingPassword.value,
);

const handleSubmit = async () => {
  formError.value = null;
  successMessage.value = null;

  if (!form.currentPassword.trim() || !form.newPassword.trim()) {
    formError.value = "Enter your current password and a new password.";
    return;
  }

  if (form.currentPassword === form.newPassword) {
    formError.value =
      "Choose a new password that is different from your current password.";
    return;
  }

  const response = await accountStore.changePassword({
    current_password: form.currentPassword,
    new_password: form.newPassword,
  });

  if (response.status === "error") {
    formError.value = response.message;
    toast.add({
      title: "Password update failed",
      description: response.message,
      color: "error",
      icon: "i-lucide-circle-alert",
    });
    return;
  }

  successMessage.value = response.message || "Your password has been updated.";
  form.currentPassword = "";
  form.newPassword = "";

  toast.add({
    title: "Password updated",
    description: successMessage.value,
    color: "success",
    icon: "i-lucide-circle-check",
  });
};
</script>

<template>
  <div class="min-h-screen bg-[linear-gradient(180deg,#f8fafc_0%,#f8fafc_55%,#eef2ff_100%)] px-4 py-10 text-slate-900 sm:px-6 lg:px-8">
    <div class="mx-auto flex w-full max-w-3xl flex-col gap-6">
      <section class="rounded-[32px] border border-slate-200/80 bg-white p-6 shadow-lg shadow-slate-200/70 sm:p-8">
        <div class="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p class="text-xs uppercase tracking-[0.22em] text-slate-500">
              Account Security
            </p>
            <h1 class="mt-3 text-3xl font-semibold tracking-tight text-slate-900">
              Change password
            </h1>
            <p class="mt-3 max-w-2xl text-sm leading-6 text-slate-600">
              Update your password for this account using the current
              authenticated session.
            </p>
          </div>

          <UButton color="neutral" variant="outline" to="/account">
            Back to account
          </UButton>
        </div>
      </section>

      <section class="rounded-[32px] border border-slate-200/80 bg-white p-6 shadow-lg shadow-slate-200/70 sm:p-8">
        <div class="space-y-6">
          <UAlert
            v-if="formError"
            color="error"
            variant="soft"
            icon="i-lucide-circle-alert"
            :title="formError"
          />

          <UAlert
            v-else-if="successMessage"
            color="success"
            variant="soft"
            icon="i-lucide-circle-check"
            :title="successMessage"
          />

          <UForm class="space-y-5" @submit.prevent="handleSubmit">
            <UFormField label="Current password" required>
              <UInput
                v-model="form.currentPassword"
                type="password"
                class="w-full"
                placeholder="Enter your current password"
                autocomplete="current-password"
              />
            </UFormField>

            <UFormField label="New password" required>
              <UInput
                v-model="form.newPassword"
                type="password"
                class="w-full"
                placeholder="Enter your new password"
                autocomplete="new-password"
              />
            </UFormField>

            <UButton
              type="submit"
              color="primary"
              size="xl"
              block
              :loading="isChangingPassword"
              :disabled="!canSubmit"
            >
              Update password
            </UButton>
          </UForm>
        </div>
      </section>
    </div>
  </div>
</template>
