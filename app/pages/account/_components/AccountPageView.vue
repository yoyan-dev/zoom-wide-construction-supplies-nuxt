<script setup lang="ts">
import { storeToRefs } from "pinia";
import type { UpdateAccountPayload } from "~/types/account";

type AccountFormState = {
  email: string;
  phone: string;
  fullName: string;
  contactName: string;
  companyName: string;
  billingAddress: string;
  shippingAddress: string;
  driverName: string;
  licenseNumber: string;
  vehicleNumber: string;
};

const authStore = useAuthStore();
const accountStore = useAccountStore();
const toast = useToast();
const { account, isLoading, isSaving } = storeToRefs(accountStore);

const form = reactive<AccountFormState>({
  email: "",
  phone: "",
  fullName: "",
  contactName: "",
  companyName: "",
  billingAddress: "",
  shippingAddress: "",
  driverName: "",
  licenseNumber: "",
  vehicleNumber: "",
});

const pageError = ref<string | null>(null);
const formError = ref<string | null>(null);
const successMessage = ref<string | null>(null);
const isRetrying = ref(false);

const returnPath = computed(() => authStore.getRoleLandingPath());
const roleLabel = computed(
  () => account.value?.user.role ?? authStore.role ?? "account",
);
const customerId = computed(
  () => account.value?.customer?.id ?? authStore.customerId,
);
const isCustomerAccount = computed(() => Boolean(account.value?.customer));
const isDriverAccount = computed(() => Boolean(account.value?.driver));

const applyAccountToForm = () => {
  form.email = account.value?.customer?.email ?? account.value?.user.email ?? "";
  form.phone =
    account.value?.customer?.phone ??
    account.value?.driver?.phone ??
    account.value?.user.phone ??
    "";
  form.fullName = account.value?.user.full_name ?? "";
  form.contactName =
    account.value?.customer?.contact_name ??
    account.value?.user.contact_name ??
    "";
  form.companyName = account.value?.customer?.company_name ?? "";
  form.billingAddress = account.value?.customer?.billing_address ?? "";
  form.shippingAddress = account.value?.customer?.shipping_address ?? "";
  form.driverName = account.value?.driver?.name ?? "";
  form.licenseNumber = account.value?.driver?.license_number ?? "";
  form.vehicleNumber = account.value?.driver?.vehicle_number ?? "";
};

const loadPage = async () => {
  const response = await accountStore.fetchAccount();

  pageError.value =
    response.status === "error"
      ? response.message || "Your account could not be loaded right now."
      : null;

  if (response.status === "success") {
    applyAccountToForm();
  }
};

await loadPage();

watch(
  () => account.value,
  () => {
    if (account.value) {
      applyAccountToForm();
    }
  },
);

const toOptionalText = (value: string) => {
  const normalized = value.trim();
  return normalized.length ? normalized : null;
};

const handleSave = async () => {
  formError.value = null;
  successMessage.value = null;

  if (!form.email.trim()) {
    formError.value = "Email address is required.";
    return;
  }

  const payload: UpdateAccountPayload = {
    email: form.email.trim(),
    phone: toOptionalText(form.phone),
  };

  if (isCustomerAccount.value) {
    payload.contact_name = form.contactName.trim();
    payload.company_name = form.companyName.trim();
    payload.billing_address = toOptionalText(form.billingAddress);
    payload.shipping_address = toOptionalText(form.shippingAddress);

    if (!payload.contact_name || !payload.company_name) {
      formError.value = "Company name and contact name are required.";
      return;
    }
  } else if (isDriverAccount.value) {
    payload.name = form.driverName.trim();
    payload.license_number = toOptionalText(form.licenseNumber);
    payload.vehicle_number = toOptionalText(form.vehicleNumber);

    if (!payload.name) {
      formError.value = "Driver name is required.";
      return;
    }
  } else {
    payload.full_name = form.fullName.trim();

    if (!payload.full_name) {
      formError.value = "Full name is required.";
      return;
    }
  }

  const response = await accountStore.updateAccount(payload);

  if (response.status === "error") {
    formError.value = response.message;
    toast.add({
      title: "Account update failed",
      description: response.message,
      color: "error",
      icon: "i-lucide-circle-alert",
    });
    return;
  }

  successMessage.value = response.message || "Your account has been updated.";
  toast.add({
    title: "Account updated",
    description: successMessage.value,
    color: "success",
    icon: "i-lucide-circle-check",
  });
};

const handleRetry = async () => {
  isRetrying.value = true;
  await loadPage();
  isRetrying.value = false;
};
</script>

<template>
  <div class="min-h-screen bg-[linear-gradient(180deg,#f8fafc_0%,#f8fafc_55%,#eef2ff_100%)] px-4 py-10 text-slate-900 sm:px-6 lg:px-8">
    <div class="mx-auto flex w-full max-w-5xl flex-col gap-6">
      <section class="rounded-[32px] border border-slate-200/80 bg-white p-6 shadow-lg shadow-slate-200/70 sm:p-8">
        <div class="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p class="text-xs uppercase tracking-[0.22em] text-slate-500">
              Account
            </p>
            <h1 class="mt-3 text-3xl font-semibold tracking-tight text-slate-900">
              Profile settings
            </h1>
            <p class="mt-3 max-w-2xl text-sm leading-6 text-slate-600">
              Review the current session identity and update the fields allowed
              for your account type.
            </p>
          </div>

          <UButton color="neutral" variant="outline" :to="returnPath">
            Back
          </UButton>
        </div>
      </section>

      <section class="grid gap-6 xl:grid-cols-[minmax(0,1.15fr)_minmax(280px,0.85fr)] xl:items-start">
        <div class="rounded-[32px] border border-slate-200/80 bg-white p-6 shadow-lg shadow-slate-200/70 sm:p-8">
          <div class="space-y-6">
            <UAlert
              v-if="pageError"
              color="error"
              variant="soft"
              icon="i-lucide-circle-alert"
              title="Account unavailable"
              :description="pageError"
            />

            <template v-else>
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

              <div v-if="isLoading" class="space-y-4">
                <USkeleton class="h-6 w-48" />
                <USkeleton class="h-11 w-full" />
                <USkeleton class="h-11 w-full" />
                <USkeleton class="h-24 w-full" />
              </div>

              <UForm v-else class="space-y-5" @submit.prevent="handleSave">
                <div class="grid gap-5 md:grid-cols-2">
                  <UFormField label="Email address" required>
                    <UInput
                      v-model="form.email"
                      type="email"
                      class="w-full"
                      placeholder="user@example.com"
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

                <template v-if="isCustomerAccount">
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

                  <UFormField label="Billing address">
                    <UTextarea
                      v-model="form.billingAddress"
                      class="w-full"
                      placeholder="Street, city, province, postal code"
                    />
                  </UFormField>

                  <UFormField label="Shipping address">
                    <UTextarea
                      v-model="form.shippingAddress"
                      class="w-full"
                      placeholder="Street, city, province, postal code"
                    />
                  </UFormField>
                </template>

                <template v-else-if="isDriverAccount">
                  <div class="grid gap-5 md:grid-cols-2">
                    <UFormField label="Driver name" required>
                      <UInput
                        v-model="form.driverName"
                        class="w-full"
                        placeholder="Driver name"
                      />
                    </UFormField>

                    <UFormField label="License number">
                      <UInput
                        v-model="form.licenseNumber"
                        class="w-full"
                        placeholder="License number"
                      />
                    </UFormField>
                  </div>

                  <UFormField label="Vehicle number">
                    <UInput
                      v-model="form.vehicleNumber"
                      class="w-full"
                      placeholder="Vehicle number"
                    />
                  </UFormField>
                </template>

                <template v-else>
                  <UFormField label="Full name" required>
                    <UInput
                      v-model="form.fullName"
                      class="w-full"
                      placeholder="Full name"
                    />
                  </UFormField>
                </template>

                <div class="flex flex-wrap items-center gap-3">
                  <UButton
                    type="submit"
                    color="primary"
                    size="lg"
                    :loading="isSaving"
                  >
                    Save changes
                  </UButton>
                  <UButton
                    color="neutral"
                    variant="ghost"
                    :loading="isRetrying"
                    @click="handleRetry"
                  >
                    Refresh
                  </UButton>
                </div>
              </UForm>
            </template>
          </div>
        </div>

        <div class="space-y-6">
          <UCard>
            <div class="space-y-4">
              <div>
                <p class="text-xs uppercase tracking-[0.18em] text-slate-500">
                  Session Summary
                </p>
                <p class="mt-2 text-lg font-semibold text-slate-900">
                  {{ account?.user.email ?? authStore.user?.email ?? "Signed in account" }}
                </p>
              </div>

              <div class="grid gap-3">
                <div class="rounded-2xl border border-slate-200/70 bg-slate-50 px-4 py-3">
                  <p class="text-xs uppercase tracking-[0.18em] text-slate-500">
                    Role
                  </p>
                  <p class="mt-1 font-medium text-slate-900">
                    {{ roleLabel }}
                  </p>
                </div>

                <div
                  v-if="customerId"
                  class="rounded-2xl border border-slate-200/70 bg-slate-50 px-4 py-3"
                >
                  <p class="text-xs uppercase tracking-[0.18em] text-slate-500">
                    Customer ID
                  </p>
                  <p class="mt-1 font-medium text-slate-900">
                    {{ customerId }}
                  </p>
                </div>
              </div>
            </div>
          </UCard>

          <UCard>
            <div class="space-y-4">
              <div>
                <p class="text-xs uppercase tracking-[0.18em] text-slate-500">
                  Security
                </p>
                <p class="mt-1 text-lg font-semibold text-slate-900">
                  Password management
                </p>
              </div>

              <p class="text-sm leading-6 text-slate-600">
                Change your password from the dedicated security form to keep
                this profile form focused on account details.
              </p>

              <UButton
                color="neutral"
                variant="outline"
                to="/account/change-password"
              >
                Change password
              </UButton>
            </div>
          </UCard>
        </div>
      </section>
    </div>
  </div>
</template>
