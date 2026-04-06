<script setup lang="ts">
import { storeToRefs } from "pinia";
import StorefrontStateCard from "~/components/storefront/StorefrontStateCard.vue";
import ShopHomeCategoryGrid from "../_components/ShopHomeCategoryGrid.vue";

definePageMeta({
  layout: "shop",
});

useSeoMeta({
  title: "Categories | ZOOM WIDE Construction Supplies",
  description:
    "Browse all construction supply categories from ZOOM WIDE in a dedicated category overview page.",
});

const route = useRoute();
const categoryStore = useCategoryStore();

const pageError = ref<string | null>(null);
const isRetrying = ref(false);

const loadPage = async () => {
  const response = await categoryStore.fetchCategories({ page: 1 });

  pageError.value =
    response.status === "success"
      ? null
      : "Categories could not be loaded right now. Please retry to refresh the latest storefront data.";
};

await loadPage();

const {
  categories,
  totalCategories,
  isLoading: isCategoriesLoading,
} = storeToRefs(categoryStore);

const activeCategoryId = computed(() =>
  typeof route.query.category_id === "string" ? route.query.category_id : "",
);

const handleRetry = async () => {
  isRetrying.value = true;
  await loadPage();
  isRetrying.value = false;
};
</script>

<template>
  <div class="pb-20 md:pb-24">
    <StorefrontPageContainer size="wide" class="pt-8 md:pt-10">
      <StorefrontPageHeader
        eyebrow="Category Directory"
        title="Explore every storefront category in one place."
        :description="`Move from broad supply discovery into focused catalog filtering with ${totalCategories || categories.length || 0} active category paths.`"
      >
        <template #actions>
          <StorefrontButton tone="primary" size="lg" to="/shop/catalog">
            Browse catalog
          </StorefrontButton>
        </template>
      </StorefrontPageHeader>
    </StorefrontPageContainer>

    <StorefrontPageContainer v-if="pageError" size="wide" class="mt-8">
      <StorefrontStateCard
        eyebrow="Categories"
        title="Category data is temporarily unavailable"
        :description="pageError"
        tone="error"
      >
        <template #actions>
          <StorefrontButton
            tone="danger"
            :loading="isRetrying"
            @click="handleRetry"
          >
            Retry
          </StorefrontButton>
        </template>
      </StorefrontStateCard>
    </StorefrontPageContainer>

    <ShopHomeCategoryGrid
      :categories="categories"
      :is-loading="isCategoriesLoading"
      :active-category-id="activeCategoryId"
    />
  </div>
</template>
