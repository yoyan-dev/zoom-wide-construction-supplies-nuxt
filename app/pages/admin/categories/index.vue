<script setup lang="ts">
import { storeToRefs } from "pinia";
import type { Category } from "~/types/category";
import CategoriesHeader from "./_components/CategoriesHeader.vue";
import CategoriesTable from "./_components/CategoriesTable.vue";

definePageMeta({
  layout: "admin",
});

const categoryStore = useCategoryStore();
const productStore = useProductStore();

await Promise.all([
  categoryStore.fetchCategories(),
  productStore.fetchProducts(),
]);

const { categories } = storeToRefs(categoryStore);
const { products } = storeToRefs(productStore);
</script>

<template>
  <div class="min-h-screen">
    <div class="space-y-6">
      <CategoriesHeader :total="categories.length" />
      <CategoriesTable :categories="categories" :products="products" />
    </div>
  </div>
</template>
