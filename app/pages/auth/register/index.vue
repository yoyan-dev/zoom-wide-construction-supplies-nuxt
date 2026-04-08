<script setup lang="ts">
import { storeToRefs } from "pinia";
import PsgcAddressFields from "~/components/address/PsgcAddressFields.vue";
import {
  createEmptyAddressDraft,
  formatAddress,
  isAddressDraftComplete,
  toAddressPayload,
} from "~/utils/address";

definePageMeta({
  layout: "auth",
});

const route = useRoute();
const authStore = useAuthStore();
const customerAddressesStore = useCustomerAddressesStore();
const toast = useToast();
const { isLoading } = storeToRefs(authStore);

const form = reactive({
  companyName: "",
  contactName: "",
  email: "",
  phone: "",
  address: createEmptyAddressDraft(),
  password: "",
  confirmPassword: "",
});

const formError = ref<string | null>(null);
const showPassword = ref(false);
const showConfirmPassword = ref(false);
const redirectTarget = computed(() =>
  typeof route.query.redirect === "string" ? route.query.redirect : null,
);

const canSubmit = computed(
  () =>
    !!form.companyName.trim() &&
    !!form.contactName.trim() &&
    !!form.email.trim() &&
    isAddressDraftComplete(form.address) &&
    !!form.password.trim() &&
    form.password === form.confirmPassword &&
    !isLoading.value,
);

const handleSubmit = async () => {
  formError.value = null;

  if (!form.companyName.trim() || !form.contactName.trim()) {
    formError.value = "Add the company and primary contact details first.";
    return;
  }

  if (!form.email.trim() || !form.password.trim()) {
    formError.value = "Email and password are required.";
    return;
  }

  if (!isAddressDraftComplete(form.address)) {
    formError.value =
      "Complete the PSGC delivery address fields before creating the account.";
    return;
  }

  if (form.password !== form.confirmPassword) {
    formError.value = "Password confirmation does not match.";
    return;
  }

  const deliveryAddressPayload = toAddressPayload(form.address);
  const formattedDeliveryAddress = formatAddress(deliveryAddressPayload);

  const registerResponse = await authStore.register({
    email: form.email.trim(),
    password: form.password,
    company_name: form.companyName.trim(),
    contact_name: form.contactName.trim(),
    phone: form.phone.trim() || null,
    billing_address: formattedDeliveryAddress || null,
    shipping_address: formattedDeliveryAddress || null,
  });

  if (registerResponse.status === "error") {
    formError.value = registerResponse.message;
    toast.add({
      title: "Registration failed",
      description: registerResponse.message,
      color: "error",
      icon: "i-lucide-circle-alert",
    });
    return;
  }

  const loginResponse = await authStore.login({
    email: form.email.trim(),
    password: form.password,
  });

  if (loginResponse.status === "error") {
    formError.value =
      "Your account was created, but the automatic sign-in step failed. Please sign in manually.";
    toast.add({
      title: "Account created",
      description: formError.value,
      color: "warning",
      icon: "i-lucide-circle-alert",
    });
    await navigateTo("/auth/login");
    return;
  }

  toast.add({
    title: "Account ready",
    description:
      registerResponse.message || "Your customer account has been created.",
    color: "success",
    icon: "i-lucide-circle-check",
  });

  const customerId =
    loginResponse.data?.customer?.id ?? authStore.customer?.id ?? null;

  if (customerId) {
    const addressResponse = await customerAddressesStore.addAddress(
      customerId,
      deliveryAddressPayload,
    );

    if (addressResponse.status === "error") {
      toast.add({
        title: "Address needs attention",
        description:
          addressResponse.message ||
          "Your account was created, but the delivery address could not be saved.",
        color: "warning",
        icon: "i-lucide-circle-alert",
      });
    }
  }

  await navigateTo(authStore.resolveRedirectPath(redirectTarget.value));
};

const loginLink = computed(() =>
  redirectTarget.value
    ? `/auth/login?redirect=${encodeURIComponent(redirectTarget.value)}`
    : "/auth/login",
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
      class="mx-auto flex min-h-[calc(100vh-5rem)] w-full max-w-4xl items-center justify-center"
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
            Create Account
          </h1>
          <p
            class="mt-2 text-[0.68rem] font-semibold uppercase tracking-[0.24em] text-slate-500"
          >
            Sign up for your account
          </p>
        </div>

        <div
          class="overflow-hidden rounded-xl border border-slate-200/80 bg-white shadow-[0_32px_64px_-12px_rgba(0,31,42,0.08)]"
        >
          <div class="h-1.5 w-full bg-amber-500" />

          <div class="p-8 md:p-10">
            <div class="mb-8">
              <p
                class="text-[0.72rem] font-semibold uppercase tracking-[0.24em] text-amber-700"
              >
                Customer registration
              </p>
              <p class="text-sm text-gray-500">
                Please fill in the form below to register your account.
                <br />
                You will be able to login with your email and password.
              </p>
            </div>

            <UAlert
              v-if="formError"
              color="error"
              variant="soft"
              icon="i-lucide-circle-alert"
              :title="formError"
              class="mb-6"
            />

            <UForm class="space-y-6" @submit.prevent="handleSubmit">
              <div class="grid gap-5 md:grid-cols-2">
                <UFormField label="Company name" required>
                  <UInput
                    v-model="form.companyName"
                    class="w-full"
                    placeholder="ZOOM Wide Builders Inc."
                  />
                </UFormField>

                <UFormField label="Contact name" required>
                  <UInput
                    v-model="form.contactName"
                    class="w-full"
                    placeholder="Jamie Santos"
                  />
                </UFormField>
              </div>

              <div class="grid gap-5 md:grid-cols-2">
                <UFormField label="Email address" required>
                  <UInput
                    v-model="form.email"
                    type="email"
                    class="w-full"
                    placeholder="buyer@company.com"
                    autocomplete="email"
                  />
                </UFormField>

                <UFormField label="Phone number">
                  <UInput
                    v-model="form.phone"
                    class="w-full"
                    placeholder="+63 900 000 0000"
                    autocomplete="tel"
                  />
                </UFormField>
              </div>

              <div
                class="rounded-xl border border-slate-200/80 bg-slate-50/80 p-5"
              >
                <PsgcAddressFields
                  v-model="form.address"
                  title="Delivery Address"
                  description="This will be saved as your first delivery address for checkout."
                />
              </div>

              <div class="grid gap-5 md:grid-cols-2">
                <UFormField label="Password" required>
                  <UInput
                    v-model="form.password"
                    :type="showPassword ? 'text' : 'password'"
                    class="w-full"
                    placeholder="Create a password"
                    autocomplete="new-password"
                    :trailing-icon="
                      showPassword ? 'i-lucide-eye-off' : 'i-lucide-eye'
                    "
                    @click:trailing="showPassword = !showPassword"
                  />
                </UFormField>

                <UFormField label="Confirm password" required>
                  <UInput
                    v-model="form.confirmPassword"
                    :type="showConfirmPassword ? 'text' : 'password'"
                    class="w-full"
                    placeholder="Repeat your password"
                    autocomplete="new-password"
                    :trailing-icon="
                      showConfirmPassword ? 'i-lucide-eye-off' : 'i-lucide-eye'
                    "
                    @click:trailing="showConfirmPassword = !showConfirmPassword"
                  />
                </UFormField>
              </div>

              <StorefrontButton
                type="submit"
                tone="primary"
                block
                :loading="isLoading"
                :disabled="!canSubmit"
              >
                Submit
              </StorefrontButton>
            </UForm>
          </div>

          <div
            class="border-t border-slate-200 bg-slate-50 px-6 py-6 text-center"
          >
            <p class="text-xs text-slate-600">
              Already registered?
              <NuxtLink
                :to="loginLink"
                class="ml-1 font-semibold uppercase tracking-tight text-[#001e40] transition hover:text-amber-700"
              >
                Sign in instead
              </NuxtLink>
            </p>
          </div>
        </div>

        <footer class="mt-10 text-center">
          <p
            class="text-[10px] font-semibold uppercase tracking-[0.22em] leading-6 text-slate-400"
          >
            (C) 2024 Zoom Wide Construction Supplies.<br />
            Built for Precision. Enterprise-Grade Security Active.
          </p>
        </footer>
      </section>
    </div>
  </div>
</template>
