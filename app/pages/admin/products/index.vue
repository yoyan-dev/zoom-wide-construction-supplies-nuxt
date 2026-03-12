<script setup lang="ts">
import type { Category } from "~/types/category";
import type { Product } from "~/types/product";
import type { Supplier } from "~/types/supplier";
import ProductsFilters from "./_components/ProductsFilters.vue";
import ProductsStats from "./_components/ProductsStats.vue";
import ProductsTable from "./_components/ProductsTable.vue";

definePageMeta({
  layout: "admin",
});

type ProductsResponse =
  | {
      products: Product[];
      categories: Category[];
      suppliers: Supplier[];
    }
  | Product[];

const { data } = await useFetch<ProductsResponse>("/api/admin/products");

const products = computed(() =>
  Array.isArray(data.value) ? data.value : (data.value?.products ?? []),
);
const categories = computed(() =>
  Array.isArray(data.value) ? [] : (data.value?.categories ?? []),
);
const suppliers = computed(() =>
  Array.isArray(data.value) ? [] : (data.value?.suppliers ?? []),
);

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
</script>

<template>
  <div class="min-h-screen p-6">
    <div class="space-y-6">
      <ProductsStats :products="products" />
      <ProductsFilters
        :search="search"
        :category-id="categoryId"
        :stock-status="stockStatus"
        :status="status"
        :category-options="categoryOptions"
        @update:search="search = $event"
        @update:category-id="categoryId = $event"
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
