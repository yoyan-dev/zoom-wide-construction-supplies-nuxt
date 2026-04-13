<script setup lang="ts">
import { storeToRefs } from "pinia";
import type { Product } from "~/types/product";
import AdminPageStateCard from "../../_components/AdminPageStateCard.vue";
import InventoryMovementModal from "./modals/InventoryMovementModal.vue";
import { useAdminPageLoadState } from "~/composables/admin/useAdminPageLoadState";
import { useModal } from "~/composables/admin/useModal";
import { buildInventoryBalanceMap } from "~/utils/inventory-balance";
import InventoryFilters from "./InventoryFilters.vue";
import InventoryStats from "./InventoryStats.vue";
import InventoryHeader from "./table/InventoryHeader.vue";
import InventoryTable from "./table/InventoryTable.vue";

const props = defineProps<{
  detailBasePath: string;
  productBasePath?: string;
}>();

const productStore = useProductStore();
const inventoryStore = useInventoryStore();
const warehouseStore = useWarehouseStore();
const { openModal } = useModal();
const { getLoadErrorMessage } = useAdminPageLoadState();
const pageError = ref<string | null>(null);
const isRetrying = ref(false);

const loadPage = async () => {
  const [productsResponse, inventoryResponse, warehousesResponse] =
    await Promise.all([
      productStore.fetchProducts({
        q: "",
        page: 1,
      }),
      inventoryStore.fetchInventoryLogs({
        q: "",
        page: 1,
      }),
      warehouseStore.fetchWarehouses({
        q: "",
        status: "",
        page: 1,
      }),
    ]);

  pageError.value =
    productsResponse.status === "success"
      ? null
      : getLoadErrorMessage(
          [productsResponse],
          "The inventory list could not be loaded right now.",
        );

  if (inventoryResponse.status === "error") {
    console.warn("Inventory movement history is unavailable for stock calculations.");
  }

  if (warehousesResponse.status === "error") {
    console.warn("Warehouse summaries are unavailable for the inventory list.");
  }
};

await loadPage();

const {
  products,
  totalProducts,
  query,
  pagination,
  isLoading: isProductsLoading,
} = storeToRefs(productStore);
const { logs, isLoading: isInventoryLoading } = storeToRefs(inventoryStore);
const { warehouses, isLoading: isWarehousesLoading } = storeToRefs(warehouseStore);

const search = computed(() => query.value.q ?? "");
const stockStatus = ref("all");

const stockStatusOptions = [
  { label: "All stock levels", value: "all" },
  { label: "Healthy stock", value: "healthy" },
  { label: "Low stock", value: "low" },
  { label: "Out of stock", value: "out" },
];

const stockMap = computed(() => buildInventoryBalanceMap(logs.value, products.value));

const filteredProducts = computed<Product[]>(() =>
  products.value.filter((product) => {
    const currentStock = stockMap.value[product.id ?? ""] ?? 0;

    if (stockStatus.value === "low") {
      return (
        currentStock <= (product.minimum_stock_quantity ?? 0) &&
        currentStock > 0
      );
    }

    if (stockStatus.value === "out") {
      return currentStock === 0;
    }

    if (stockStatus.value === "healthy") {
      return currentStock > (product.minimum_stock_quantity ?? 0);
    }

    return true;
  }),
);

const isPageLoading = computed(
  () =>
    isProductsLoading.value ||
    isInventoryLoading.value ||
    isWarehousesLoading.value,
);

const handleSearch = async (value: string) => {
  await productStore.fetchProducts({
    q: value,
    page: 1,
  });
};

const handleStockStatus = async (value: string) => {
  stockStatus.value = value;
  await productStore.fetchProducts({
    q: search.value,
    page: 1,
  });
};

const handlePageChange = async (page: number) => {
  await productStore.fetchProducts({
    q: search.value,
    page,
  });
};

const handleCreate = () => {
  void openModal(InventoryMovementModal, {
    products: products.value,
    onSaved: loadPage,
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
      <InventoryHeader :total="totalProducts" @create="handleCreate" />

      <template v-if="pageError">
        <AdminPageStateCard
          eyebrow="Inventory"
          title="Inventory unavailable"
          :description="pageError"
          tone="error"
          action-label="Retry"
          :action-loading="isRetrying"
          @action="handleRetry"
        />
      </template>

      <template v-else>
        <InventoryStats
          :products="products"
          :inventory-logs="logs"
        />
        <InventoryFilters
          :search="search"
          :stock-status="stockStatus"
          :stock-status-options="stockStatusOptions"
          @update:search="handleSearch"
          @update:stock-status="handleStockStatus"
        />
        <InventoryTable
          :products="filteredProducts"
          :inventory-logs="logs"
          :warehouses="warehouses"
          :search="search"
          :stock-status="stockStatus"
          :detail-base-path="props.detailBasePath"
          :product-base-path="props.productBasePath"
          :is-loading="isPageLoading"
          :pagination="pagination"
          @page-change="handlePageChange"
          @movement-saved="loadPage"
        />
      </template>
    </div>
  </div>
</template>
