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

  const customerId = loginResponse.data?.customer?.id ?? authStore.customer?.id ?? null;

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
  <div class="min-h-screen px-4 py-10 text-slate-900 sm:px-6 lg:px-8">
    <div
      class="mx-auto flex justify-center items-center w-full max-w-6xl gap-8"
    >
      <section
        class="rounded-[32px] border border-slate-200/80 bg-white p-6 shadow-lg shadow-slate-200/70 sm:p-8"
      >
        <div class="space-y-6">
          <div>
            <p class="text-xs uppercase tracking-[0.22em] text-lime-700">
              Create Account
            </p>
            <h2
              class="mt-3 text-3xl font-semibold tracking-tight text-slate-900"
            >
              Register your customer profile
            </h2>
            <p class="mt-3 text-sm leading-6 text-slate-600">
              This signup is limited to customer accounts and signs you in right
              after the API responds successfully.
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

            <div class="rounded-3xl border border-slate-200/80 bg-slate-50/80 p-5">
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
                  type="password"
                  class="w-full"
                  placeholder="Create a password"
                  autocomplete="new-password"
                />
              </UFormField>

              <UFormField label="Confirm password" required>
                <UInput
                  v-model="form.confirmPassword"
                  type="password"
                  class="w-full"
                  placeholder="Repeat your password"
                  autocomplete="new-password"
                />
              </UFormField>
            </div>

            <UButton
              type="submit"
              color="success"
              size="xl"
              block
              :loading="isLoading"
              :disabled="!canSubmit"
            >
              Create customer account
            </UButton>
          </UForm>

          <div
            class="rounded-3xl border border-dashed border-slate-200 bg-slate-50 px-4 py-4 text-sm text-slate-600"
          >
            Already registered?
            <NuxtLink
              :to="loginLink"
              class="font-semibold text-lime-700 hover:text-lime-800"
            >
              Sign in instead.
            </NuxtLink>
          </div>
        </div>
      </section>
    </div>
  </div>
</template>
