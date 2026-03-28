<script setup lang="ts">
import { storeToRefs } from "pinia";
import AdminPageStateCard from "../_components/AdminPageStateCard.vue";
import AddUserModal from "./_components/modals/AddUserModal.vue";
import UsersFilters from "./_components/UsersFilters.vue";
import UserHeader from "./_components/table/UserHeader.vue";
import UsersTable from "./_components/table/UsersTable.vue";
import {
  INTERNAL_USER_ROLE_OPTIONS,
  USER_STATUS_OPTIONS,
} from "./_components/internal-user-options";
import { useAdminPageLoadState } from "~/composables/admin/useAdminPageLoadState";
import { useModal } from "~/composables/admin/useModal";

definePageMeta({
  layout: "admin",
});

const authStore = useAuthStore();

if (!authStore.hasAnyRole(["admin"])) {
  await navigateTo(authStore.getRoleLandingPath());
}

const userStore = useUserStore();
const { openModal } = useModal();
const { getLoadErrorMessage } = useAdminPageLoadState();
const pageError = ref<string | null>(null);
const isRetrying = ref(false);

const loadPage = async () => {
  const usersResponse = await userStore.fetchUsers();

  pageError.value =
    usersResponse.status === "success"
      ? null
      : getLoadErrorMessage(
          [usersResponse],
          "The internal users list could not be loaded right now.",
        );
};

await loadPage();

const { users, query, isLoading } = storeToRefs(userStore);
const search = computed(() => query.value.q ?? "");
const role = ref("all");
const status = ref("all");

const roleOptions = [
  { label: "All internal roles", value: "all" },
  ...INTERNAL_USER_ROLE_OPTIONS,
];

const handleCreate = () => {
  openModal(AddUserModal);
};

const handleSearch = async (value: string) => {
  await userStore.fetchUsers({
    q: value,
    page: 1,
  });
};

const handleRole = (value: string) => {
  role.value = value;
};

const handleStatus = (value: string) => {
  status.value = value;
};

const handleRetry = async () => {
  isRetrying.value = true;
  await loadPage();
  isRetrying.value = false;
};
</script>

<template>
  <div class="min-h-screen">
    <div class="space-y-6">
      <UserHeader :total="users.length" @create="handleCreate" />

      <template v-if="pageError">
        <AdminPageStateCard
          eyebrow="Internal Users"
          title="Internal users unavailable"
          :description="pageError"
          tone="error"
          action-label="Retry"
          :action-loading="isRetrying"
          @action="handleRetry"
        />
      </template>

      <template v-else>
        <UsersFilters
          :search="search"
          :role="role"
          :status="status"
          :role-options="roleOptions"
          :status-options="USER_STATUS_OPTIONS"
          @update:search="handleSearch"
          @update:role="handleRole"
          @update:status="handleStatus"
        />

        <UsersTable
          :users="users"
          :search="search"
          :role="role"
          :status="status"
          :is-loading="isLoading"
        />
      </template>
    </div>
  </div>
</template>
