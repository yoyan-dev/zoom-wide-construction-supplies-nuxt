<script setup lang="ts">
import { storeToRefs } from "pinia";
import type { UpdateAccountPayload } from "~/types/account";

definePageMeta({
  layout: "shop",
});

useSeoMeta({
  title: "Profile Settings | ZOOM WIDE Construction Supplies",
  description:
    "Update your customer contact details, company profile, and storefront account information.",
});

const accountStore = useAccountStore();
const authStore = useAuthStore();
const toast = useToast();
const router = useRouter();
const { account, isLoading, isSaving } = storeToRefs(accountStore);

const form = reactive({
  companyName: "",
  contactName: "",
  email: "",
  phone: "",
  imageUrl: "",
  billingAddress: "",
  shippingAddress: "",
});

const pageError = ref<string | null>(null);
const formError = ref<string | null>(null);
const successMessage = ref<string | null>(null);
const isRetrying = ref(false);
const imageFile = ref<File | null>(null);

const previewImage = computed(
  () => form.imageUrl.trim() || account.value?.user.image_url || undefined,
);

const applyAccountToForm = () => {
  form.companyName = account.value?.customer?.company_name ?? "";
  form.contactName =
    account.value?.customer?.contact_name ??
    account.value?.user.full_name ??
    "";
  form.email = account.value?.user.email ?? "";
  form.phone =
    account.value?.customer?.phone ?? account.value?.user.phone ?? "";
  form.imageUrl = account.value?.user.image_url ?? "";
  form.billingAddress = account.value?.customer?.billing_address ?? "";
  form.shippingAddress = account.value?.customer?.shipping_address ?? "";
  imageFile.value = null;
};

const loadPage = async () => {
  const response = await accountStore.fetchAccount();

  pageError.value =
    response.status === "error"
      ? response.message || "Your account settings could not be loaded."
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

const appendOptionalText = (
  formData: FormData,
  key: keyof UpdateAccountPayload,
  value: string | null,
) => {
  formData.append(key, value ?? "");
};

const buildAccountPayload = () => {
  const payload: UpdateAccountPayload = {
    full_name: form.contactName.trim(),
    contact_name: form.contactName.trim(),
    company_name: toOptionalText(form.companyName),
    email: form.email.trim(),
    phone: toOptionalText(form.phone),
    image_url: toOptionalText(form.imageUrl),
    billing_address: toOptionalText(form.billingAddress),
    shipping_address: toOptionalText(form.shippingAddress),
  };

  if (!imageFile.value) {
    return payload;
  }

  const formData = new FormData();

  appendOptionalText(formData, "full_name", payload.full_name ?? null);
  appendOptionalText(formData, "contact_name", payload.contact_name ?? null);
  appendOptionalText(formData, "company_name", payload.company_name ?? null);
  appendOptionalText(formData, "email", payload.email ?? null);
  appendOptionalText(formData, "phone", payload.phone ?? null);
  appendOptionalText(formData, "image_url", payload.image_url ?? null);
  appendOptionalText(
    formData,
    "billing_address",
    payload.billing_address ?? null,
  );
  appendOptionalText(
    formData,
    "shipping_address",
    payload.shipping_address ?? null,
  );
  formData.append("imageFile", imageFile.value);

  return formData;
};

const handleImageChange = (file: File | null) => {
  imageFile.value = file;
};

const handleSave = async () => {
  formError.value = null;
  successMessage.value = null;

  if (!form.contactName.trim()) {
    formError.value = "Contact name is required.";
    return;
  }

  if (!form.email.trim()) {
    formError.value = "Email address is required.";
    return;
  }

  const response = await accountStore.updateAccount(buildAccountPayload());

  if (response.status === "error") {
    formError.value = response.message;
    toast.add({
      title: "Profile update failed",
      description: response.message,
      color: "error",
      icon: "i-lucide-circle-alert",
    });
    return;
  }

  successMessage.value = response.message || "Your profile was updated.";
  toast.add({
    title: "Profile updated",
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

const goToSecurity = () => {
  void router.push("/shop/account/security");
};

const goBack = () => {
  void router.push("/shop/account");
};
</script>

<template>
  <StorefrontPageContainer size="wide" class="py-8 md:py-10">
    <section
      class="rounded-lg border border-slate-200/80 bg-white/95 p-6 shadow-[0_20px_40px_rgba(15,23,42,0.05)] md:p-8"
    >
      <div
        class="flex flex-col gap-4 md:flex-row md:items-start md:justify-between"
      >
        <div>
          <p class="text-xs uppercase tracking-[0.18em] text-slate-500">
            Shop Account
          </p>
          <h1 class="mt-2 text-3xl font-bold text-brand-950">
            Profile settings
          </h1>
          <p
            class="mt-2 max-w-3xl text-sm leading-7 text-slate-600 md:text-base"
          >
            Update your profile and the contact data used across the storefront
            and checkout flow.
          </p>
        </div>

        <div class="flex flex-wrap gap-3">
          <UButton color="neutral" variant="outline" @click="goBack">
            Back to account
          </UButton>
          <UButton color="warning" variant="soft" @click="goToSecurity">
            Security settings
          </UButton>
        </div>
      </div>
    </section>

    <div
      class="mt-6 grid gap-6 xl:grid-cols-[minmax(0,1.1fr)_minmax(300px,0.9fr)] xl:items-start"
    >
      <UCard class="rounded-[1.5rem]">
        <div class="space-y-6">
          <UAlert
            v-if="pageError"
            color="error"
            variant="soft"
            icon="i-lucide-circle-alert"
            title="Profile settings unavailable"
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
              <USkeleton class="h-11 w-full" />
              <USkeleton class="h-24 w-full" />
            </div>

            <UForm v-else class="space-y-5" @submit.prevent="handleSave">
              <div
                class="grid gap-5 lg:grid-cols-[240px_minmax(0,1fr)] lg:items-start"
              >
                <div
                  class="rounded-[1.25rem] border border-slate-200/70 bg-slate-50 p-5"
                >
                  <p class="text-xs uppercase tracking-[0.18em] text-slate-500">
                    Profile image
                  </p>

                  <div class="mt-4 flex flex-col items-center gap-3">
                    <AccountImageInput
                      :key="`account-image:${account?.user.id ?? 'user'}:${account?.user.image_url ?? ''}`"
                      :initial-image="previewImage"
                      :alt="form.contactName || authStore.displayName"
                      @change="handleImageChange"
                    />
                    <p class="text-center text-xs text-slate-500">
                      Upload an account image.
                    </p>
                  </div>
                </div>

                <div class="space-y-5">
                  <div class="grid gap-5 md:grid-cols-2">
                    <UFormField label="Company name">
                      <UInput
                        v-model="form.companyName"
                        class="w-full"
                        placeholder="Zoom Wide partner company"
                      />
                    </UFormField>

                    <UFormField label="Contact name" required>
                      <UInput
                        v-model="form.contactName"
                        class="w-full"
                        placeholder="Primary buyer contact"
                        autocomplete="name"
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
                </div>
              </div>

              <div class="flex flex-wrap items-center gap-3">
                <UButton type="submit" color="warning" :loading="isSaving">
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
      </UCard>

      <div class="space-y-6">
        <UCard class="rounded-[1.5rem]">
          <div class="space-y-4">
            <div>
              <p class="text-xs uppercase tracking-[0.18em] text-slate-500">
                Signed-in account
              </p>
              <p class="mt-1 text-lg font-semibold text-slate-900">
                {{
                  account?.user.email ??
                  authStore.user?.email ??
                  "Customer account"
                }}
              </p>
            </div>

            <div
              class="rounded-[1.25rem] border border-slate-200/70 bg-slate-50 p-4"
            >
              <p class="text-xs uppercase tracking-[0.18em] text-slate-500">
                Full name
              </p>
              <p class="mt-2 font-medium capitalize text-slate-900">
                {{
                  account?.user.full_name ??
                  authStore.user?.full_name ??
                  "Customer account"
                }}
              </p>
            </div>
          </div>
        </UCard>

        <UCard class="rounded-[1.5rem]">
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
              Password changes stay on the dedicated security page so profile
              edits and credential updates remain clearly separated.
            </p>

            <UButton color="warning" variant="soft" block @click="goToSecurity">
              Change password
            </UButton>
          </div>
        </UCard>
      </div>
    </div>
  </StorefrontPageContainer>
</template>
