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
  rememberSession: true,
});

const formError = ref<string | null>(null);
const showPassword = ref(false);
const redirectTarget = computed(() =>
  typeof route.query.redirect === "string" ? route.query.redirect : null,
);
const canSubmit = computed(
  () => !!form.email.trim() && !!form.password.trim() && !isLoading.value,
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

const forgotPasswordLink = computed(() =>
  redirectTarget.value
    ? `/auth/forgot-password?redirect=${encodeURIComponent(redirectTarget.value)}`
    : "/auth/forgot-password",
);
</script>

<template>
  <div
    class="relative min-h-screen overflow-hidden px-4 py-10 text-slate-900 sm:px-6 lg:px-8"
  >
    <div
      class="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(0,70,135,0.12),transparent_28rem),radial-gradient(circle_at_bottom_right,rgba(254,117,11,0.08),transparent_24rem)]"
    />
    <div
      class="pointer-events-none absolute inset-0 bg-[radial-gradient(#001e40_1px,transparent_1px)] bg-size-[40px_40px] opacity-[0.08]"
    />
    <div
      class="pointer-events-none absolute -left-20 -top-24 h-72 w-72 rounded-full bg-[#003366]/10 blur-3xl"
    />
    <div
      class="pointer-events-none absolute -bottom-24 -right-24 h-80 w-80 rounded-full bg-amber-500/10 blur-3xl"
    />

    <div
      class="mx-auto flex min-h-[calc(100vh-5rem)] w-full max-w-md items-center justify-center"
    >
      <section class="relative w-full">
        <div class="mb-10 flex flex-col items-center text-center">
          <NuxtLink
            to="/shop"
            class="flex items-center justify-center text-lg font-black"
          >
            <NuxtImg src="/logo-full.png" width="150" />
          </NuxtLink>
          <h1
            class="mt-6 text-3xl font-bold tracking-tight text-[#001e40] uppercase"
          >
            Login
          </h1>
          <p
            class="mt-2 text-[0.68rem] font-semibold uppercase tracking-[0.24em] text-slate-500"
          >
            Sign in to your account
          </p>
        </div>

        <div
          class="overflow-hidden rounded-xl border border-slate-200/80 bg-white shadow-[0_32px_64px_-12px_rgba(0,31,42,0.08)]"
        >
          <div class="h-1.5 w-full bg-amber-500" />

          <div class="p-8 md:p-10">
            <UAlert
              v-if="formError"
              color="error"
              variant="soft"
              icon="i-lucide-circle-alert"
              :title="formError"
              class="mb-6"
            />

            <form class="space-y-6" @submit="handleSubmit">
              <div class="space-y-2">
                <label
                  for="email"
                  class="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-600"
                >
                  <UIcon name="i-lucide-mail" class="text-sm" />
                  Email Address
                </label>
                <input
                  id="email"
                  v-model="form.email"
                  type="email"
                  autocomplete="email"
                  placeholder="professional@firm.com"
                  class="w-full border-0 border-b border-slate-200 bg-transparent px-0 py-3 text-sm text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-amber-600"
                />
              </div>

              <div class="space-y-2">
                <div class="flex items-end justify-between gap-4">
                  <label
                    for="password"
                    class="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-600"
                  >
                    <UIcon name="i-lucide-lock" class="text-sm" />
                    Password
                  </label>
                  <NuxtLink
                    :to="forgotPasswordLink"
                    class="text-[10px] font-semibold uppercase tracking-[0.16em] text-amber-700 transition hover:text-amber-800"
                  >
                    Forgot Password?
                  </NuxtLink>
                </div>

                <div class="relative">
                  <input
                    id="password"
                    v-model="form.password"
                    :type="showPassword ? 'text' : 'password'"
                    autocomplete="current-password"
                    placeholder="********"
                    class="w-full border-0 border-b border-slate-200 bg-transparent px-0 py-3 pr-10 text-sm text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-amber-600"
                  />
                  <button
                    type="button"
                    class="absolute right-0 top-1/2 -translate-y-1/2 text-slate-400 transition hover:text-slate-700"
                    @click="showPassword = !showPassword"
                  >
                    <UIcon
                      :name="showPassword ? 'i-lucide-eye-off' : 'i-lucide-eye'"
                      class="text-base"
                    />
                  </button>
                </div>
              </div>

              <label class="flex items-center gap-2 text-xs text-slate-600">
                <input
                  v-model="form.rememberSession"
                  type="checkbox"
                  class="h-4 w-4 rounded-sm border-slate-300 text-amber-600 focus:ring-amber-200"
                />
                <span>Maintain active session for 30 days</span>
              </label>

              <StorefrontButton
                type="submit"
                tone="primary"
                block
                :loading="isLoading"
                :disabled="!canSubmit"
              >
                Sign In
              </StorefrontButton>
            </form>

          </div>

          <div
            class="border-t border-slate-200 bg-slate-50 px-6 py-6 text-center"
          >
            <p class="text-xs text-slate-600">
              New to the Zoom Wide network?
              <NuxtLink
                :to="registerLink"
                class="ml-1 font-semibold uppercase tracking-tight text-[#001e40] transition hover:text-amber-700"
              >
                Create an Account
              </NuxtLink>
            </p>
          </div>
        </div>

        <footer class="mt-10 text-center">
          <p
            class="text-[10px] font-semibold uppercase tracking-[0.22em] leading-6 text-slate-400"
          >
            (C) 2024 Zoom Wide Construction Supplies.<br />
            Built for Precision. Enterprise-Grade Security Active.<br />
          </p>
        </footer>
      </section>
    </div>
  </div>
</template>
