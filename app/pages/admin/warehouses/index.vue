<script setup lang="ts">
import { storeToRefs } from "pinia";
import type { WarehouseStatus } from "~/types/warehouse";
import AdminPermissionNotice from "../_components/AdminPermissionNotice.vue";
import AdminPageStateCard from "../_components/AdminPageStateCard.vue";
import AddWarehouseModal from "./_components/modals/AddWarehouseModal.vue";
import WarehouseHeader from "./_components/table/WarehouseHeader.vue";
import WarehousesFilters from "./_components/WarehousesFilters.vue";
import WarehousesTable from "./_components/table/WarehousesTable.vue";
import { WAREHOUSE_STATUS_OPTIONS } from "./_components/warehouse-options";
import { useAdminPageLoadState } from "~/composables/admin/useAdminPageLoadState";
import { useModal } from "~/composables/admin/useModal";

definePageMeta({
  layout: "admin",
});

const authStore = useAuthStore();
const warehouseStore = useWarehouseStore();
const { openModal } = useModal();
const { getLoadErrorMessage } = useAdminPageLoadState();
const pageError = ref<string | null>(null);
const isRetrying = ref(false);

const loadPage = async () => {
  const warehousesResponse = await warehouseStore.fetchWarehouses();

  pageError.value =
    warehousesResponse.status === "success"
      ? null
      : getLoadErrorMessage(
          [warehousesResponse],
          "The warehouses list could not be loaded right now.",
        );
};

await loadPage();

const { warehouses, totalWarehouses, query, isLoading } =
  storeToRefs(warehouseStore);
const search = computed(() => query.value.q ?? "");
const status = ref("all");

const handleCreate = () => {
  if (!authStore.hasAnyRole(["admin", "warehouse_manager"])) return;
  void openModal(AddWarehouseModal);
};

const handleSearch = async (value: string) => {
  await warehouseStore.fetchWarehouses({
    q: value,
    status: status.value === "all" ? "" : (status.value as WarehouseStatus),
    page: 1,
  });
};

const handleStatus = async (value: string) => {
  status.value = value;

  await warehouseStore.fetchWarehouses({
    q: search.value,
    status: value === "all" ? "" : (value as WarehouseStatus),
    page: 1,
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
      <WarehouseHeader
        :total="totalWarehouses"
        :can-create="authStore.hasAnyRole(['admin', 'warehouse_manager'])"
        @create="handleCreate"
      />

      <template v-if="pageError">
        <AdminPageStateCard
          eyebrow="Warehouses"
          title="Warehouses unavailable"
          :description="pageError"
          tone="error"
          action-label="Retry"
          :action-loading="isRetrying"
          @action="handleRetry"
        />
      </template>

      <template v-else>
        <AdminPermissionNotice
          v-if="!authStore.hasAnyRole(['admin', 'warehouse_manager'])"
          description="Your role can review warehouse records, but creating, editing, activating, or deleting warehouses is restricted to warehouse-authorized accounts."
        />
        <WarehousesFilters
          :search="search"
          :status="status"
          :status-options="WAREHOUSE_STATUS_OPTIONS"
          @update:search="handleSearch"
          @update:status="handleStatus"
        />

        <WarehousesTable
          :warehouses="warehouses"
          :search="search"
          :status="status"
          :is-loading="isLoading"
        />
      </template>
    </div>
  </div>
</template>
