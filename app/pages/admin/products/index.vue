<script setup lang="ts">
import { storeToRefs } from "pinia";
import AdminPageStateCard from "../_components/AdminPageStateCard.vue";
import ProductsFilters from "./_components/ProductsFilters.vue";
import ProductsStats from "./_components/ProductsStats.vue";
import ProductHeader from "./_components/table/ProductHeader.vue";
import ProductsTable from "./_components/table/ProductsTable.vue";
import { useAdminPageLoadState } from "~/composables/admin/useAdminPageLoadState";

definePageMeta({
  layout: "admin",
});

const productStore = useProductStore();
const categoryStore = useCategoryStore();
const warehouseStore = useWarehouseStore();
const inventoryStore = useInventoryStore();
const { getLoadErrorMessage } = useAdminPageLoadState();
const pageError = ref<string | null>(null);
const isRetrying = ref(false);

const loadPage = async () => {
  const [
    productsResponse,
    categoriesResponse,
    warehousesResponse,
    inventoryResponse,
  ] = await Promise.all([
    productStore.fetchProducts(),
    categoryStore.fetchCategories(),
    warehouseStore.fetchWarehouses(),
    inventoryStore.fetchInventoryLogs(),
  ]);

  pageError.value =
    productsResponse.status === "success" &&
    categoriesResponse.status === "success" &&
    warehousesResponse.status === "success" &&
    inventoryResponse.status === "success"
      ? null
      : getLoadErrorMessage(
          [
            productsResponse,
            categoriesResponse,
            warehousesResponse,
            inventoryResponse,
          ],
          "The products list could not be loaded right now.",
        );
};

await loadPage();

const { products, totalProducts, query, pagination, isLoading } =
  storeToRefs(productStore);
const { categories } = storeToRefs(categoryStore);
const { warehouses } = storeToRefs(warehouseStore);
const { logs } = storeToRefs(inventoryStore);

const search = computed(() => query.value.q ?? "");
const categoryId = ref("all");
const stockStatus = ref("all");
const status = ref("all");

const categoryOptions = computed(() => [
  { label: "All categories", value: "all" },
  ...categories.value.map((category) => ({
    label: category.name,
    value: category.id,
  })),
]);

const fetchProductsPage = async (page = 1) => {
  await productStore.fetchProducts({
    q: search.value,
    category_id: categoryId.value === "all" ? undefined : categoryId.value,
    page,
  });
};

const handleSearch = async (value: string) => {
  await productStore.fetchProducts({
    q: value,
    category_id: categoryId.value === "all" ? undefined : categoryId.value,
    page: 1,
  });
};

const handleCategoryFilter = async (value: string) => {
  categoryId.value = value;
  await fetchProductsPage(1);
};

const handleStockStatus = async (value: string) => {
  stockStatus.value = value;
  await fetchProductsPage(1);
};

const handleStatus = async (value: string) => {
  status.value = value;
  await fetchProductsPage(1);
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
      <ProductHeader :total="totalProducts" />
      <template v-if="pageError">
        <AdminPageStateCard
          eyebrow="Products"
          title="Products unavailable"
          :description="pageError"
          tone="error"
          action-label="Retry"
          :action-loading="isRetrying"
          @action="handleRetry"
        />
      </template>
      <template v-else>
        <ProductsStats :products="products" :inventory-logs="logs" />
        <ProductsFilters
          :search="search"
          :category-id="categoryId"
          :stock-status="stockStatus"
          :status="status"
          :category-options="categoryOptions"
          @update:search="handleSearch"
          @update:category-id="handleCategoryFilter"
          @update:stock-status="handleStockStatus"
          @update:status="handleStatus"
        />
        <ProductsTable
          :products="products"
          :categories="categories"
          :warehouses="warehouses"
          :inventory-logs="logs"
          :search="search"
          :category-id="categoryId"
          :stock-status="stockStatus"
          :status="status"
          :is-loading="isLoading"
          :pagination="pagination"
          @page-change="fetchProductsPage"
        />
      </template>
    </div>
  </div>
</template>
