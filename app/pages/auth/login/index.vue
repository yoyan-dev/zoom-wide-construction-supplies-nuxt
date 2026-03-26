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

const canSubmit = computed(
  () => !!form.email.trim() && !!form.password.trim() && !isLoading.value,
);

const handleSubmit = async () => {
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
  <div
    class="min-h-screen bg-[radial-gradient(circle_at_top_left,#fef3c7_0%,#fff7ed_28%,#f8fafc_72%)] px-4 py-10 text-slate-900 sm:px-6 lg:px-8"
  >
    <div
      class="mx-auto grid w-full max-w-6xl gap-8 lg:grid-cols-[minmax(0,1.05fr)_minmax(420px,0.95fr)] lg:items-stretch"
    >
      <!-- <section class="rounded-[32px] border border-amber-200/70 bg-slate-900 px-6 py-8 text-white shadow-xl sm:px-8 sm:py-10">
        <div class="flex h-full flex-col justify-between gap-8">
          <div>
            <p class="text-xs uppercase tracking-[0.28em] text-amber-300">
              Customer Access
            </p>
            <h1 class="mt-4 max-w-xl text-4xl font-semibold tracking-tight sm:text-5xl">
              Sign in to track orders, manage delivery details, and keep purchasing moving.
            </h1>
            <p class="mt-4 max-w-2xl text-sm leading-7 text-slate-300 sm:text-base">
              This login uses your backend auth API and routes you by account role after sign-in.
            </p>
          </div>

          <div class="grid gap-4 sm:grid-cols-3">
            <div class="rounded-3xl border border-white/10 bg-white/5 p-4">
              <p class="text-xs uppercase tracking-[0.18em] text-slate-400">
                Orders
              </p>
              <p class="mt-2 text-sm leading-6 text-slate-200">
                Customer accounts land in a dedicated order history flow.
              </p>
            </div>
            <div class="rounded-3xl border border-white/10 bg-white/5 p-4">
              <p class="text-xs uppercase tracking-[0.18em] text-slate-400">
                Routing
              </p>
              <p class="mt-2 text-sm leading-6 text-slate-200">
                Admin and staff roles redirect to their existing workspaces.
              </p>
            </div>
            <div class="rounded-3xl border border-white/10 bg-white/5 p-4">
              <p class="text-xs uppercase tracking-[0.18em] text-slate-400">
                Checkout
              </p>
              <p class="mt-2 text-sm leading-6 text-slate-200">
                Customer data can prefill checkout and customer-owned order flows.
              </p>
            </div>
          </div>
        </div>
      </section> -->

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
              color="warning"
              size="xl"
              block
              :loading="isLoading"
              :disabled="!canSubmit"
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
