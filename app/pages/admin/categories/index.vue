<script setup lang="ts">
import { storeToRefs } from "pinia";
import type { Category } from "~/types/category";
import CategoriesHeader from "./_components/CategoriesHeader.vue";
import CategoriesTable from "./_components/CategoriesTable.vue";
import CategoryFormModal from "./_components/modals/CategoryFormModal.vue";
import CategoryViewModal from "./_components/modals/CategoryViewModal.vue";
import CategoryDeleteModal from "./_components/modals/CategoryDeleteModal.vue";

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
const createOpen = ref(false);
const editOpen = ref(false);
const viewOpen = ref(false);
const deleteOpen = ref(false);

const openEdit = (category: Category) => {
  selectedCategory.value = category;
  editOpen.value = true;
};

const openView = (category: Category) => {
  selectedCategory.value = category;
  viewOpen.value = true;
};

const openDelete = (category: Category) => {
  selectedCategory.value = category;
  deleteOpen.value = true;
};

const openCreate = () => {
  selectedCategory.value = null;
  createOpen.value = true;
};

type CategoryDraft = Omit<Category, "id" | "created_at" | "updated_at">;

const handleCreate = async (payload: CategoryDraft) => {
  await categoryStore.createCategory(payload);
  createOpen.value = false;
};

const handleUpdate = async (payload: CategoryDraft) => {
  if (!selectedCategory.value?.id) return;
  await categoryStore.updateCategory(selectedCategory.value.id, payload);
  editOpen.value = false;
};

const handleDelete = async () => {
  if (!selectedCategory.value?.id) return;
  await categoryStore.deleteCategory(selectedCategory.value.id);
  deleteOpen.value = false;
};
</script>

<template>
  <div class="min-h-screen">
    <div class="space-y-6">
      <CategoriesHeader :total="categories.length" @create="openCreate" />
      <CategoriesTable
        :categories="categories"
        :products="products"
        @view="openView"
        @edit="openEdit"
        @delete="openDelete"
      />
    </div>
  </div>

  <CategoryFormModal
    :open="createOpen"
    mode="create"
    :category="null"
    @update:open="createOpen = $event"
    @submit="handleCreate"
  />
  <CategoryFormModal
    :open="editOpen"
    mode="edit"
    :category="selectedCategory"
    @update:open="editOpen = $event"
    @submit="handleUpdate"
  />
  <CategoryViewModal
    :open="viewOpen"
    :category="selectedCategory"
    @update:open="viewOpen = $event"
  />
  <CategoryDeleteModal
    :open="deleteOpen"
    :category="selectedCategory"
    @update:open="deleteOpen = $event"
    @confirm="handleDelete"
  />
</template>
