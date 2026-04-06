<script setup lang="ts">
import { storeToRefs } from "pinia";

definePageMeta({
  layout: "shop",
});

useSeoMeta({
  title: "Security Settings | ZOOM WIDE Construction Supplies",
  description:
    "Change your customer password and keep your storefront account secure.",
});

const accountStore = useAccountStore();
const toast = useToast();
const router = useRouter();
const { isChangingPassword } = storeToRefs(accountStore);

const form = reactive({
  currentPassword: "",
  newPassword: "",
  confirmPassword: "",
});

const formError = ref<string | null>(null);
const successMessage = ref<string | null>(null);

const canSubmit = computed(
  () =>
    !!form.currentPassword.trim() &&
    !!form.newPassword.trim() &&
    !!form.confirmPassword.trim() &&
    !isChangingPassword.value,
);

const handleSubmit = async () => {
  formError.value = null;
  successMessage.value = null;

  if (!form.currentPassword.trim() || !form.newPassword.trim()) {
    formError.value = "Enter your current password and a new password.";
    return;
  }

  if (form.newPassword !== form.confirmPassword) {
    formError.value = "New password and confirmation must match.";
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
  form.confirmPassword = "";

  toast.add({
    title: "Password updated",
    description: successMessage.value,
    color: "success",
    icon: "i-lucide-circle-check",
  });
};

const goBack = () => {
  void router.push("/shop/account/settings");
};
</script>

<template>
  <StorefrontPageContainer size="wide" class="py-8 md:py-10">
    <section class="sf-card rounded-[1.5rem] border border-slate-200/80 bg-white/95 p-6 md:p-8">
      <div class="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div>
          <p class="text-xs uppercase tracking-[0.18em] text-slate-500">
            Shop Account
          </p>
          <h1 class="sf-display mt-2 text-3xl font-bold tracking-[-0.05em] text-brand-950">
            Security settings
          </h1>
          <p class="mt-2 max-w-3xl text-sm leading-7 text-slate-600 md:text-base">
            Change your password without mixing credential updates into your main storefront profile settings.
          </p>
        </div>

        <UButton color="neutral" variant="outline" @click="goBack">
          Back to profile settings
        </UButton>
      </div>
    </section>

    <div class="mt-6 grid gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(280px,0.85fr)] xl:items-start">
      <UCard class="rounded-[1.5rem]">
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

            <div class="grid gap-5 md:grid-cols-2">
              <UFormField label="New password" required>
                <UInput
                  v-model="form.newPassword"
                  type="password"
                  class="w-full"
                  placeholder="Enter your new password"
                  autocomplete="new-password"
                />
              </UFormField>

              <UFormField label="Confirm new password" required>
                <UInput
                  v-model="form.confirmPassword"
                  type="password"
                  class="w-full"
                  placeholder="Confirm your new password"
                  autocomplete="new-password"
                />
              </UFormField>
            </div>

            <UButton
              type="submit"
              color="warning"
              :loading="isChangingPassword"
              :disabled="!canSubmit"
            >
              Update password
            </UButton>
          </UForm>
        </div>
      </UCard>

      <UCard class="rounded-[1.5rem]">
        <div class="space-y-4">
          <div>
            <p class="text-xs uppercase tracking-[0.18em] text-slate-500">
              Security notes
            </p>
            <p class="mt-1 text-lg font-semibold text-slate-900">
              Keep customer access secure
            </p>
          </div>

          <div class="space-y-3">
            <div class="rounded-[1.25rem] border border-slate-200/70 bg-slate-50 px-4 py-3 text-sm text-slate-700">
              Use a password that is different from your previous one.
            </div>
            <div class="rounded-[1.25rem] border border-slate-200/70 bg-slate-50 px-4 py-3 text-sm text-slate-700">
              Update credentials from the current authenticated session only.
            </div>
            <div class="rounded-[1.25rem] border border-slate-200/70 bg-slate-50 px-4 py-3 text-sm text-slate-700">
              Profile edits and password changes stay separated for clarity.
            </div>
          </div>
        </div>
      </UCard>
    </div>
  </StorefrontPageContainer>
</template>
