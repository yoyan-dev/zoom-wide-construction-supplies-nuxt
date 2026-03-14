<script setup lang="ts">
import { storeToRefs } from "pinia";
import CategoriesHeader from "./_components/CategoriesHeader.vue";
import CategoriesTable from "./_components/CategoriesTable.vue";
import CategoryEditModal from "./_components/CategoryEditModal.vue";

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
      <CategoriesHeader :total="categories.length" />
      <CategoriesTable
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
