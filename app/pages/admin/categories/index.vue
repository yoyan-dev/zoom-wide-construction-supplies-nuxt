<script setup lang="ts">
import { storeToRefs } from "pinia";
import AdminPageStateCard from "../_components/AdminPageStateCard.vue";
import CategoriesFilters from "./_components/CategoriesFilters.vue";
import CategoriesHeader from "./_components/table/CategoriesHeader.vue";
import CategoriesTable from "./_components/table/CategoriesTable.vue";
import AddCategoryModal from "./_components/modals/AddCategoryModal.vue";
import { useAdminPageLoadState } from "~/composables/admin/useAdminPageLoadState";
import { useModal } from "~/composables/admin/useModal";

definePageMeta({
  layout: "admin",
});

const categoryStore = useCategoryStore();
const productStore = useProductStore();
const { openModal } = useModal();
const { getLoadErrorMessage } = useAdminPageLoadState();
const pageError = ref<string | null>(null);
const isRetrying = ref(false);

const loadPage = async () => {
  const [categoriesResponse, productsResponse] = await Promise.all([
    categoryStore.fetchCategories(),
    productStore.fetchProducts(),
  ]);

  pageError.value =
    categoriesResponse.status === "success" &&
    productsResponse.status === "success"
      ? null
      : getLoadErrorMessage(
          [categoriesResponse, productsResponse],
          "The categories list could not be loaded right now.",
        );
};

await loadPage();

const { categories, query, isLoading } = storeToRefs(categoryStore);
const { products } = storeToRefs(productStore);

const search = computed(() => query.value.q ?? "");

const handleCreate = () => {
  openModal(AddCategoryModal);
};

const handleSearch = async (value: string) => {
  await categoryStore.fetchCategories({
    q: value,
    page: 1,
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
      <CategoriesHeader :total="categories.length" @create="handleCreate" />
      <template v-if="pageError">
        <AdminPageStateCard
          eyebrow="Categories"
          title="Categories unavailable"
          :description="pageError"
          tone="error"
          action-label="Retry"
          :action-loading="isRetrying"
          @action="handleRetry"
        />
      </template>
      <template v-else>
        <CategoriesFilters :search="search" @update:search="handleSearch" />
        <CategoriesTable
          :categories="categories"
          :products="products"
          :is-loading="isLoading"
        />
      </template>
    </div>
  </div>
</template>
