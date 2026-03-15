<script setup lang="ts">
import { storeToRefs } from "pinia";
import ProductsFilters from "./_components/ProductsFilters.vue";
import ProductsStats from "./_components/ProductsStats.vue";
import ProductsTable from "./_components/table/ProductsTable.vue";

definePageMeta({
  layout: "admin",
});

const productStore = useProductStore();
const categoryStore = useCategoryStore();
const supplierStore = useSupplierStore();

await Promise.all([
  productStore.fetchProducts(),
  categoryStore.fetchCategories(),
  supplierStore.fetchSuppliers(),
]);

const { products, query } = storeToRefs(productStore);
const { categories } = storeToRefs(categoryStore);
const { suppliers } = storeToRefs(supplierStore);

const stockStatus = ref("all");
const status = ref("all");

const search = computed(() => query.value.q ?? "");
const categoryId = computed(() => query.value.category_id || "all");

const categoryOptions = computed(() => [
  { label: "All categories", value: "all" },
  ...categories.value.map((category) => ({
    label: category.name,
    value: category.id,
  })),
]);

const handleSearch = async (value: string) => {
  await productStore.setSearch(value);
};

const handleCategoryFilter = async (value: string) => {
  await productStore.setFilter({
    category_id: value === "all" ? "" : value,
  });
};
</script>

<template>
  <div class="min-h-screen">
    <div class="space-y-6">
      <ProductsStats :products="products" />
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
        :suppliers="suppliers"
        :search="search"
        :category-id="categoryId"
        :stock-status="stockStatus"
        :status="status"
      />
    </div>
  </div>
</template>
