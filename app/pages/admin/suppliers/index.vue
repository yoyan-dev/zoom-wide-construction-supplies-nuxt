<script setup lang="ts">
import { storeToRefs } from "pinia";
import AdminPageStateCard from "../_components/AdminPageStateCard.vue";
import AddSupplierModal from "./_components/modals/AddSupplierModal.vue";
import SuppliersFilters from "./_components/SuppliersFilters.vue";
import { SUPPLIER_STATUS_OPTIONS } from "./_components/supplier-options";
import SupplierHeader from "./_components/table/SupplierHeader.vue";
import SuppliersTable from "./_components/table/SuppliersTable.vue";
import { useAdminPageLoadState } from "~/composables/admin/useAdminPageLoadState";
import { useModal } from "~/composables/admin/useModal";

definePageMeta({
  layout: "admin",
});

const authStore = useAuthStore();

if (!authStore.hasAnyRole(["admin"])) {
  await navigateTo(authStore.getRoleLandingPath());
}

const supplierStore = useSupplierStore();
const { openModal } = useModal();
const { getLoadErrorMessage } = useAdminPageLoadState();
const pageError = ref<string | null>(null);
const isRetrying = ref(false);

const loadPage = async () => {
  const suppliersResponse = await supplierStore.fetchSuppliers();

  pageError.value =
    suppliersResponse.status === "success"
      ? null
      : getLoadErrorMessage(
          [suppliersResponse],
          "The suppliers list could not be loaded right now.",
        );
};

await loadPage();

const { suppliers, totalSuppliers, query, pagination, isLoading } =
  storeToRefs(supplierStore);
const search = computed(() => query.value.q ?? "");
const status = ref("all");

const handleCreate = () => {
  if (!authStore.hasAnyRole(["admin"])) return;
  void openModal(AddSupplierModal);
};

const handleSearch = async (value: string) => {
  await supplierStore.fetchSuppliers({
    q: value,
    page: 1,
  });
};

const handleStatus = async (value: string) => {
  status.value = value;
  await supplierStore.fetchSuppliers({
    q: search.value,
    page: 1,
  });
};

const handlePageChange = async (page: number) => {
  await supplierStore.fetchSuppliers({
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
      <SupplierHeader :total="totalSuppliers" @create="handleCreate" />

      <template v-if="pageError">
        <AdminPageStateCard
          eyebrow="Suppliers"
          title="Suppliers unavailable"
          :description="pageError"
          tone="error"
          action-label="Retry"
          :action-loading="isRetrying"
          @action="handleRetry"
        />
      </template>

      <template v-else>
        <SuppliersFilters
          :search="search"
          :status="status"
          :status-options="SUPPLIER_STATUS_OPTIONS"
          @update:search="handleSearch"
          @update:status="handleStatus"
        />

        <SuppliersTable
          :suppliers="suppliers"
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
