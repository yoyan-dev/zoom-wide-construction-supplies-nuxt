<script setup lang="ts">
import { storeToRefs } from "pinia";
import AdminPageStateCard from "../_components/AdminPageStateCard.vue";
import ProductsFilters from "./_components/ProductsFilters.vue";
import ProductsStats from "./_components/ProductsStats.vue";
import ProductHeader from "./_components/table/ProductHeader.vue";
import ProductsTable from "./_components/table/ProductsTable.vue";
import { useAdminPageLoadState } from "~/composables/admin/useAdminPageLoadState";
import type { InventoryLog } from "~/types/inventory";
import type { Warehouse } from "~/types/warehouse";

definePageMeta({
  layout: "admin",
});

const productStore = useProductStore();
const categoryStore = useCategoryStore();
const { getLoadErrorMessage } = useAdminPageLoadState();
const pageError = ref<string | null>(null);
const isRetrying = ref(false);

const loadPage = async () => {
  const [productsResponse, categoriesResponse] = await Promise.all([
    productStore.fetchProducts(),
    categoryStore.fetchCategories(),
  ]);

  pageError.value =
    productsResponse.status === "success" &&
    categoriesResponse.status === "success"
      ? null
      : getLoadErrorMessage(
          [productsResponse, categoriesResponse],
          "The products list could not be loaded right now.",
        );
};

await loadPage();

const { products, isLoading } = storeToRefs(productStore);
const { categories } = storeToRefs(categoryStore);
const logs = ref<InventoryLog[]>([]);
const warehouses = ref<Warehouse[]>([]);

const search = ref("");
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

const handleSearch = async (value: string) => {
  search.value = value;
};

const handleCategoryFilter = async (value: string) => {
  categoryId.value = value;
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
      <ProductHeader :total="products.length" />
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
          @update:stock-status="stockStatus = $event"
          @update:status="status = $event"
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
        />
      </template>
    </div>
  </div>
</template>
