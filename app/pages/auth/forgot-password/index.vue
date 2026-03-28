<script setup lang="ts">
import { storeToRefs } from "pinia";

definePageMeta({
  layout: "auth",
});

const authStore = useAuthStore();
const toast = useToast();
const { isLoading } = storeToRefs(authStore);

const form = reactive({
  email: "",
});

const formError = ref<string | null>(null);
const successMessage = ref<string | null>(null);

const canSubmit = computed(() => !!form.email.trim() && !isLoading.value);

const handleSubmit = async () => {
  formError.value = null;
  successMessage.value = null;

  if (!form.email.trim()) {
    formError.value = "Enter your email address to request a password reset.";
    return;
  }

  const response = await authStore.forgotPassword({
    email: form.email.trim(),
  });

  if (response.status === "error") {
    formError.value = response.message;
    toast.add({
      title: "Reset request failed",
      description: response.message,
      color: "error",
      icon: "i-lucide-circle-alert",
    });
    return;
  }

  successMessage.value =
    response.message ||
    "If an account exists for that email, a reset link has been sent.";

  toast.add({
    title: "Reset email requested",
    description: successMessage.value,
    color: "success",
    icon: "i-lucide-circle-check",
  });
};
</script>

<template>
  <div class="min-h-screen px-4 py-10 text-slate-900 sm:px-6 lg:px-8">
    <div class="mx-auto flex w-full max-w-6xl items-center justify-center">
      <section
        class="rounded-[32px] border border-slate-200/80 bg-white p-6 shadow-lg shadow-slate-200/70 sm:p-8"
      >
        <div class="space-y-6">
          <div>
            <p class="text-xs uppercase tracking-[0.22em] text-amber-600">
              Password Reset
            </p>
            <h2
              class="mt-3 text-3xl font-semibold tracking-tight text-slate-900"
            >
              Request a reset email
            </h2>
            <p class="mt-3 text-sm leading-6 text-slate-600">
              Enter the email address linked to your account and we will request
              a password reset email from the API.
            </p>
          </div>

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
            <UFormField label="Email address" required>
              <UInput
                v-model="form.email"
                type="email"
                class="w-full"
                placeholder="buyer@company.com"
                autocomplete="email"
              />
            </UFormField>

            <UButton
              type="submit"
              color="primary"
              size="xl"
              block
              :loading="isLoading"
              :disabled="!canSubmit"
            >
              Send reset email
            </UButton>
          </UForm>

          <div
            class="rounded-3xl border border-dashed border-slate-200 bg-slate-50 px-4 py-4 text-sm text-slate-600"
          >
            Remembered your password?
            <NuxtLink
              to="/auth/login"
              class="font-semibold text-amber-700 hover:text-amber-800"
            >
              Return to sign in.
            </NuxtLink>
          </div>
        </div>
      </section>
    </div>
  </div>
</template>
