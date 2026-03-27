<script setup lang="ts">
import { storeToRefs } from "pinia";

definePageMeta({
  layout: "auth",
});

const route = useRoute();
const authStore = useAuthStore();
const toast = useToast();
const { isLoading } = storeToRefs(authStore);

const form = reactive({
  email: "",
  password: "",
});

const formError = ref<string | null>(null);
const redirectTarget = computed(() =>
  typeof route.query.redirect === "string" ? route.query.redirect : null,
);

const handleSubmit = async (e: Event) => {
  e.preventDefault();
  formError.value = null;

  if (!form.email.trim() || !form.password.trim()) {
    formError.value = "Enter your email and password to continue.";
    return;
  }

  const response = await authStore.login({
    email: form.email.trim(),
    password: form.password,
  });

  if (response.status === "error") {
    formError.value = response.message;
    toast.add({
      title: "Sign in failed",
      description: response.message,
      color: "error",
      icon: "i-lucide-circle-alert",
    });
    return;
  }

  toast.add({
    title: "Welcome back",
    description: response.message || "Your account is ready.",
    color: "success",
    icon: "i-lucide-circle-check",
  });

  await navigateTo(authStore.resolveRedirectPath(redirectTarget.value));
};

const registerLink = computed(() =>
  redirectTarget.value
    ? `/auth/register?redirect=${encodeURIComponent(redirectTarget.value)}`
    : "/auth/register",
);
</script>

<template>
  <div class="min-h-screen px-4 py-10 text-slate-900 sm:px-6 lg:px-8">
    <div class="mx-auto w-full flex justify-center items-center max-w-6xl">
      <section
        class="rounded-[32px] border border-slate-200/80 bg-white p-6 shadow-lg shadow-slate-200/70 sm:p-8"
      >
        <div class="space-y-6">
          <div>
            <p class="text-xs uppercase tracking-[0.22em] text-amber-600">
              Sign In
            </p>
            <h2
              class="mt-3 text-3xl font-semibold tracking-tight text-slate-900"
            >
              Welcome back
            </h2>
            <p class="mt-3 text-sm leading-6 text-slate-600">
              Use the same customer credentials created during registration.
            </p>
          </div>

          <UAlert
            v-if="formError"
            color="error"
            variant="soft"
            icon="i-lucide-circle-alert"
            :title="formError"
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

            <UFormField label="Password" required>
              <UInput
                v-model="form.password"
                type="password"
                class="w-full"
                placeholder="Enter your password"
                autocomplete="current-password"
              />
            </UFormField>

            <UButton
              type="submit"
              color="primary"
              size="xl"
              block
              :loading="isLoading"
            >
              Sign in
            </UButton>
          </UForm>

          <div
            class="rounded-3xl border border-dashed border-slate-200 bg-slate-50 px-4 py-4 text-sm text-slate-600"
          >
            New customer account?
            <NuxtLink
              :to="registerLink"
              class="font-semibold text-amber-700 hover:text-amber-800"
            >
              Create one here.
            </NuxtLink>
          </div>
        </div>
      </section>
    </div>
  </div>
</template>
