<script setup lang="ts">
import { storeToRefs } from "pinia";
import AdminPageStateCard from "../_components/AdminPageStateCard.vue";
import SuppliersFilters from "./_components/SuppliersFilters.vue";
import SupplierHeader from "./_components/table/SupplierHeader.vue";
import SupplierTable from "./_components/table/SupplierTable.vue";
import AddSupplierModal from "./_components/modals/AddSupplierModal.vue";
import { useAdminPageLoadState } from "~/composables/admin/useAdminPageLoadState";
import { useModal } from "~/composables/admin/useModal";

definePageMeta({
  layout: "admin",
});

const supplierStore = useSupplierStore();
const productStore = useProductStore();
const { openModal } = useModal();
const { getLoadErrorMessage } = useAdminPageLoadState();
const pageError = ref<string | null>(null);
const isRetrying = ref(false);

const loadPage = async () => {
  const [suppliersResponse, productsResponse] = await Promise.all([
    supplierStore.fetchSuppliers(),
    productStore.fetchProducts(),
  ]);

  pageError.value =
    suppliersResponse.status === "success" &&
    productsResponse.status === "success"
      ? null
      : getLoadErrorMessage(
          [suppliersResponse, productsResponse],
          "The suppliers list could not be loaded right now.",
        );
};

await loadPage();

const { suppliers, query, isLoading } = storeToRefs(supplierStore);
const { products } = storeToRefs(productStore);

const search = computed(() => query.value.q ?? "");

const handleCreate = () => {
  openModal(AddSupplierModal);
};

const handleSearch = async (value: string) => {
  await supplierStore.fetchSuppliers({
    q: value,
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
      <SupplierHeader :total="suppliers.length" @create="handleCreate" />
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
        <SuppliersFilters :search="search" @update:search="handleSearch" />
        <SupplierTable
          :suppliers="suppliers"
          :products="products"
          :is-loading="isLoading"
        />
      </template>
    </div>
  </div>
</template>
