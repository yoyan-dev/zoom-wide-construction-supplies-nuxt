<script setup lang="ts">
import { storeToRefs } from "pinia";
import AdminPageStateCard from "../_components/AdminPageStateCard.vue";
import AddDriverModal from "./_components/modals/AddDriverModal.vue";
import DriversFilters from "./_components/DriversFilters.vue";
import DriverHeader from "./_components/table/DriverHeader.vue";
import DriversTable from "./_components/table/DriversTable.vue";
import { DRIVER_STATUS_OPTIONS } from "./_components/driver-options";
import { useAdminPageLoadState } from "~/composables/admin/useAdminPageLoadState";
import { useModal } from "~/composables/admin/useModal";

definePageMeta({
  layout: "admin",
});

const authStore = useAuthStore();

if (!authStore.hasAnyRole(["admin"])) {
  await navigateTo(authStore.getRoleLandingPath());
}

const driverStore = useDriverStore();
const { openModal } = useModal();
const { getLoadErrorMessage } = useAdminPageLoadState();
const pageError = ref<string | null>(null);
const isRetrying = ref(false);

const loadPage = async () => {
  const driversResponse = await driverStore.fetchDrivers();

  pageError.value =
    driversResponse.status === "success"
      ? null
      : getLoadErrorMessage(
          [driversResponse],
          "The drivers list could not be loaded right now.",
        );
};

await loadPage();

const { drivers, totalDrivers, query, pagination, isLoading } =
  storeToRefs(driverStore);
const search = computed(() => query.value.q ?? "");
const status = ref("all");

const handleCreate = () => {
  if (!authStore.hasAnyRole(["admin"])) return;
  void openModal(AddDriverModal);
};

const handleSearch = async (value: string) => {
  await driverStore.fetchDrivers({
    q: value,
    page: 1,
  });
};

const handleStatus = async (value: string) => {
  status.value = value;
  await driverStore.fetchDrivers({
    q: search.value,
    page: 1,
  });
};

const handlePageChange = async (page: number) => {
  await driverStore.fetchDrivers({
    q: search.value,
    page,
  });
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
      <DriverHeader :total="totalDrivers" @create="handleCreate" />

      <template v-if="pageError">
        <AdminPageStateCard
          eyebrow="Drivers"
          title="Drivers unavailable"
          :description="pageError"
          tone="error"
          action-label="Retry"
          :action-loading="isRetrying"
          @action="handleRetry"
        />
      </template>

      <template v-else>
        <DriversFilters
          :search="search"
          :status="status"
          :status-options="DRIVER_STATUS_OPTIONS"
          @update:search="handleSearch"
          @update:status="handleStatus"
        />

        <DriversTable
          :drivers="drivers"
          :search="search"
          :status="status"
          :is-loading="isLoading"
          :pagination="pagination"
          @page-change="handlePageChange"
        />
      </template>
    </div>
  </div>
</template>
