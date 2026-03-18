<script setup lang="ts">
import { storeToRefs } from "pinia";
import CategoriesHeader from "./_components/table/CategoriesHeader.vue";
import CategoriesTable from "./_components/table/CategoriesTable.vue";
import AddCategoryModal from "./_components/modals/AddCategoryModal.vue";
import { useModal } from "~/composables/admin/useModal";

definePageMeta({
  layout: "admin",
});

const categoryStore = useCategoryStore();
const productStore = useProductStore();
const { openModal } = useModal();

await Promise.all([
  categoryStore.fetchCategories(),
  productStore.fetchProducts(),
]);

const { categories } = storeToRefs(categoryStore);
const { products } = storeToRefs(productStore);

const handleCreate = () => {
  openModal(AddCategoryModal);
};
</script>

<template>
  <div class="min-h-screen">
    <div class="space-y-6">
      <CategoriesHeader :total="categories.length" @create="handleCreate" />
      <CategoriesTable :categories="categories" :products="products" />
    </div>
  </div>
</template>
