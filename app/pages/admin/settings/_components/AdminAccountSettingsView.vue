<script setup lang="ts">
import { storeToRefs } from "pinia";
import type { UpdateAccountPayload } from "~/types/account";

const accountStore = useAccountStore();
const authStore = useAuthStore();
const toast = useToast();
const router = useRouter();
const { account, isLoading, isSaving } = storeToRefs(accountStore);

const form = reactive({
  fullName: "",
  email: "",
  phone: "",
  imageUrl: "",
});

const pageError = ref<string | null>(null);
const formError = ref<string | null>(null);
const successMessage = ref<string | null>(null);
const isRetrying = ref(false);

const previewImage = computed(
  () => form.imageUrl.trim() || account.value?.user.image_url || undefined,
);

const applyAccountToForm = () => {
  form.fullName = account.value?.user.full_name ?? "";
  form.email = account.value?.user.email ?? "";
  form.phone = account.value?.user.phone ?? "";
  form.imageUrl = account.value?.user.image_url ?? "";
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

const handleSave = async () => {
  formError.value = null;
  successMessage.value = null;

  if (!form.fullName.trim()) {
    formError.value = "Full name is required.";
    return;
  }

  if (!form.email.trim()) {
    formError.value = "Email address is required.";
    return;
  }

  const payload: UpdateAccountPayload = {
    full_name: form.fullName.trim(),
    email: form.email.trim(),
    phone: toOptionalText(form.phone),
    image_url: toOptionalText(form.imageUrl),
  };

  const response = await accountStore.updateAccount(payload);

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

  successMessage.value = response.message || "Your account settings were updated.";
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
  void router.push("/admin/settings/security");
};
</script>

<template>
  <div class="min-h-screen space-y-6">
    <section class="rounded-3xl border border-slate-200/70 bg-white p-6 shadow-sm md:p-8">
      <div class="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div>
          <p class="text-xs uppercase tracking-[0.18em] text-slate-500">
            Admin Settings
          </p>
          <h1 class="mt-2 text-2xl font-semibold md:text-3xl">Account settings</h1>
          <p class="mt-2 max-w-3xl text-sm text-slate-600 md:text-base">
            Update your admin profile details, contact information, and profile image URL.
          </p>
        </div>

        <UButton color="neutral" variant="outline" @click="goToSecurity">
          Security settings
        </UButton>
      </div>
    </section>

    <div class="grid gap-6 xl:grid-cols-[minmax(0,1.1fr)_minmax(300px,0.9fr)] xl:items-start">
      <UCard>
        <div class="space-y-6">
          <UAlert
            v-if="pageError"
            color="error"
            variant="soft"
            icon="i-lucide-circle-alert"
            title="Account settings unavailable"
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
              <USkeleton class="h-11 w-full" />
            </div>

            <UForm v-else class="space-y-5" @submit.prevent="handleSave">
              <div class="grid gap-5 md:grid-cols-[220px_minmax(0,1fr)] md:items-start">
                <div class="rounded-2xl border border-slate-200/70 bg-slate-50 p-5">
                  <p class="text-xs uppercase tracking-[0.18em] text-slate-500">
                    Profile Image
                  </p>

                  <div class="mt-4 flex flex-col items-center gap-3">
                    <UAvatar
                      :src="previewImage"
                      :alt="form.fullName || authStore.displayName"
                      size="3xl"
                    />
                    <p class="text-center text-xs text-slate-500">
                      Paste a hosted image URL to update your admin avatar.
                    </p>
                  </div>
                </div>

                <div class="space-y-5">
                  <UFormField label="Full name" required>
                    <UInput
                      v-model="form.fullName"
                      class="w-full"
                      placeholder="Admin full name"
                      autocomplete="name"
                    />
                  </UFormField>

                  <UFormField label="Email address" required>
                    <UInput
                      v-model="form.email"
                      type="email"
                      class="w-full"
                      placeholder="admin@zoom.local"
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

                  <UFormField label="Profile image URL">
                    <UInput
                      v-model="form.imageUrl"
                      class="w-full"
                      placeholder="https://example.com/admin-avatar.jpg"
                    />
                  </UFormField>
                </div>
              </div>

              <div class="flex flex-wrap items-center gap-3">
                <UButton
                  type="submit"
                  color="primary"
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
      </UCard>

      <div class="space-y-6">
        <UCard>
          <div class="space-y-4">
            <div>
              <p class="text-xs uppercase tracking-[0.18em] text-slate-500">
                Signed-In Account
              </p>
              <p class="mt-1 text-lg font-semibold text-slate-900">
                {{ account?.user.email ?? authStore.user?.email ?? "Admin account" }}
              </p>
            </div>

            <div class="rounded-2xl border border-slate-200/70 bg-slate-50 p-4">
              <p class="text-xs uppercase tracking-[0.18em] text-slate-500">
                Role
              </p>
              <p class="mt-2 font-medium capitalize text-slate-900">
                {{ account?.user.role ?? authStore.role ?? "admin" }}
              </p>
            </div>

            <div class="rounded-2xl border border-slate-200/70 bg-slate-50 p-4">
              <p class="text-xs uppercase tracking-[0.18em] text-slate-500">
                Account ID
              </p>
              <p class="mt-2 break-all font-medium text-slate-900">
                {{ account?.user.id ?? authStore.user?.id ?? "_" }}
              </p>
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
              Password changes are handled on the security page so credential updates stay separate from profile edits.
            </p>

            <UButton color="primary" variant="soft" block @click="goToSecurity">
              Change password
            </UButton>
          </div>
        </UCard>
      </div>
    </div>
  </div>
</template>
