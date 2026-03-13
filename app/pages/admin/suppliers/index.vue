<script setup lang="ts">
import type { Category } from "~/types/category";
import type { Product } from "~/types/product";
import SupplierHeader from "./_components/SupplierHeader.vue";
import SupplierTable from "./_components/SupplierTable.vue";
import CategoryEditModal from "./_components/SupplierEditModal.vue";

definePageMeta({
  layout: "admin",
});

const { data: categoriesData } = await useFetch<Category[]>(
  "/api/admin/categories",
);
const { data: productsData } = await useFetch<Product[]>(
  "/api/admin/products?only=products",
);

const categories = computed(() => categoriesData.value ?? []);
const products = computed(() => productsData.value ?? []);

const selectedCategory = ref<Category | null>(null);
const editOpen = ref(false);

const openEdit = (category: Category) => {
  selectedCategory.value = category;
  editOpen.value = true;
};
</script>

<template>
  <div class="min-h-screen">
    <div class="space-y-6">
      <SupplierHeader :total="categories.length" />
      <SupplierTable
        :categories="categories"
        :products="products"
        @edit="openEdit"
      />
    </div>
  </div>

  <!-- <CategoryEditModal
    :open="editOpen"
    :category="selectedCategory"
    @update:open="editOpen = $event"
  /> -->
</template>
