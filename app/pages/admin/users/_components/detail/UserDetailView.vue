<script setup lang="ts">
import { storeToRefs } from "pinia";
import AdminPageStateCard from "../../../_components/AdminPageStateCard.vue";
import UserDeleteModal from "../modals/UserDeleteModal.vue";
import UserEditModal from "../modals/UserEditModal.vue";
import UserStatusModal from "../modals/UserStatusModal.vue";
import { useAdminPageLoadState } from "~/composables/admin/useAdminPageLoadState";
import { useModal } from "~/composables/admin/useModal";
import { formatLongDate } from "~/utils/format";
import {
  getInternalUserRoleLabel,
  getUserStatusColor,
  getUserStatusLabel,
} from "../internal-user-options";

const props = defineProps<{
  userId: string;
}>();

const authStore = useAuthStore();
const userStore = useUserStore();
const { getLoadErrorMessage, isMissingResourceResponse } =
  useAdminPageLoadState();
const { openModal } = useModal();
const router = useRouter();
const pageError = ref<string | null>(null);
const isMissingUser = ref(false);
const isRetrying = ref(false);

const loadPage = async () => {
  const userResponse = await userStore.fetchUserById(props.userId);

  isMissingUser.value = isMissingResourceResponse(userResponse);
  pageError.value =
    userResponse.status === "error" && !isMissingUser.value
      ? getLoadErrorMessage(
          [userResponse],
          "The internal user could not be loaded right now.",
        )
      : null;
};

await loadPage();

const { user } = storeToRefs(userStore);

const goBack = () => {
  void router.push("/admin/users");
};

const editUser = () => {
  if (!authStore.hasAnyRole(["admin"])) return;
  if (!user.value) return;
  void openModal(UserEditModal, user.value);
};

const toggleStatus = () => {
  if (!authStore.hasAnyRole(["admin"])) return;
  if (!user.value) return;
  void openModal(UserStatusModal, user.value);
};

const deleteUser = () => {
  if (!authStore.hasAnyRole(["admin"])) return;
  if (!user.value) return;
  void openModal(UserDeleteModal, user.value);
};

const retryLoad = async () => {
  isRetrying.value = true;
  await loadPage();
  isRetrying.value = false;
};
</script>

<template>
  <div class="min-h-screen">
    <div class="space-y-6">
      <section class="rounded-sm bg-white p-2 dark:bg-gray-900">
        <div
          class="flex flex-col gap-4 md:flex-row md:items-center md:justify-between"
        >
          <div>
            <p class="text-xs uppercase tracking-[0.18em] text-slate-500">
              Internal User Management
            </p>
            <h1 class="mt-2 text-2xl font-semibold">
              {{ user?.full_name ?? "Internal user not found" }}
            </h1>
            <p class="mt-2 text-sm text-slate-600">
              Review identity, role assignment, activation state, and contact
              details for this internal account only.
            </p>
          </div>
          <div class="flex flex-wrap items-center gap-2">
            <UButton color="neutral" variant="outline" @click="goBack">
              Back to Users
            </UButton>
            <UButton
              v-if="user?.id && authStore.hasAnyRole(['admin'])"
              color="primary"
              @click="editUser"
            >
              Edit User
            </UButton>
            <UButton
              v-if="user?.id && authStore.hasAnyRole(['admin'])"
              :color="user?.is_active ? 'warning' : 'success'"
              variant="soft"
              @click="toggleStatus"
            >
              {{ user?.is_active ? "Deactivate" : "Activate" }}
            </UButton>
            <UButton
              v-if="user?.id && authStore.hasAnyRole(['admin'])"
              color="error"
              variant="soft"
              @click="deleteUser"
            >
              Delete User
            </UButton>
          </div>
        </div>
      </section>

      <AdminPageStateCard
        v-if="pageError"
        eyebrow="Internal User Details"
        title="Internal user unavailable"
        :description="pageError"
        tone="error"
        action-label="Retry"
        :action-loading="isRetrying"
        @action="retryLoad"
      />

      <AdminPageStateCard
        v-else-if="isMissingUser || !user"
        eyebrow="Internal User Details"
        title="Internal user not found"
        description="Check the URL or return to the internal users list."
        action-label="Back to Users"
        action-color="neutral"
        action-icon="i-lucide-arrow-left"
        @action="goBack"
      />

      <template v-else>
        <div class="grid gap-6 xl:grid-cols-[minmax(0,1.1fr)_minmax(280px,0.9fr)] xl:items-start">
          <UCard>
            <div class="space-y-6">
              <div class="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <p class="text-xs uppercase tracking-[0.18em] text-slate-500">
                    Identity
                  </p>
                  <p class="mt-2 text-xl font-semibold text-slate-900">
                    {{ user.full_name }}
                  </p>
                  <p class="mt-1 text-sm text-slate-600">
                    {{ user.email }}
                  </p>
                </div>

                <div class="flex flex-wrap items-center gap-2">
                  <UBadge color="primary" variant="subtle">
                    {{ getInternalUserRoleLabel(user.role) }}
                  </UBadge>
                  <UBadge
                    :color="getUserStatusColor(user.is_active)"
                    variant="subtle"
                  >
                    {{ getUserStatusLabel(user.is_active) }}
                  </UBadge>
                </div>
              </div>

              <div class="grid gap-4 md:grid-cols-2">
                <div class="rounded-sm border border-slate-200/70 bg-white p-4 dark:bg-gray-900">
                  <p class="text-xs uppercase tracking-[0.18em] text-slate-500">
                    Phone
                  </p>
                  <p class="mt-2 font-medium text-slate-900">
                    {{ user.phone ?? "No phone number" }}
                  </p>
                </div>

                <div class="rounded-sm border border-slate-200/70 bg-white p-4 dark:bg-gray-900">
                  <p class="text-xs uppercase tracking-[0.18em] text-slate-500">
                    User ID
                  </p>
                  <p class="mt-2 break-all font-medium text-slate-900">
                    {{ user.id }}
                  </p>
                </div>
              </div>
            </div>
          </UCard>

          <div class="space-y-6">
            <UCard>
              <div class="space-y-4">
                <div>
                  <p class="text-xs uppercase tracking-[0.18em] text-slate-500">
                    Lifecycle
                  </p>
                  <p class="mt-1 text-lg font-semibold text-slate-900">
                    Account timestamps
                  </p>
                </div>

                <div class="rounded-sm border border-slate-200/70 bg-white p-4 dark:bg-gray-900">
                  <p class="text-xs uppercase tracking-[0.18em] text-slate-500">
                    Created
                  </p>
                  <p class="mt-2 font-medium text-slate-900">
                    {{ formatLongDate(user.created_at) }}
                  </p>
                </div>

                <div class="rounded-sm border border-slate-200/70 bg-white p-4 dark:bg-gray-900">
                  <p class="text-xs uppercase tracking-[0.18em] text-slate-500">
                    Updated
                  </p>
                  <p class="mt-2 font-medium text-slate-900">
                    {{ formatLongDate(user.updated_at) }}
                  </p>
                </div>
              </div>
            </UCard>

            <UCard>
              <div class="space-y-4">
                <div>
                  <p class="text-xs uppercase tracking-[0.18em] text-slate-500">
                    Module Scope
                  </p>
                  <p class="mt-1 text-lg font-semibold text-slate-900">
                    Internal accounts only
                  </p>
                </div>

                <p class="text-sm leading-6 text-slate-600">
                  Customers stay in the customers module, and driver accounts
                  stay in the drivers module. This page is only for internal
                  role-based accounts.
                </p>
              </div>
            </UCard>
          </div>
        </div>
      </template>
    </div>
  </div>
</template>
