<script setup lang="ts">
import { storeToRefs } from "pinia";
import StorefrontStateCard from "~/components/storefront/StorefrontStateCard.vue";
import ShopHomeTrustSection from "../_components/ShopHomeTrustSection.vue";

definePageMeta({
  layout: "shop",
});

useSeoMeta({
  title: "Standards | ZOOM WIDE Construction Supplies",
  description:
    "Review the storefront trust signals, supply standards, and procurement guidance behind ZOOM WIDE's catalog experience.",
});

const productStore = useProductStore();
const categoryStore = useCategoryStore();

const pageError = ref<string | null>(null);
const isRetrying = ref(false);

const loadPage = async () => {
  const [productsResponse, categoriesResponse] = await Promise.all([
    productStore.fetchProducts({ page: 1 }),
    categoryStore.fetchCategories({ page: 1 }),
  ]);

  pageError.value =
    productsResponse.status === "success" &&
    categoriesResponse.status === "success"
      ? null
      : "The standards overview could not load its latest catalog metrics right now. Please retry.";
};

await loadPage();

const {
  products,
  totalProducts,
  isLoading: isProductsLoading,
} = storeToRefs(productStore);
const {
  categories,
  totalCategories,
  isLoading: isCategoriesLoading,
} = storeToRefs(categoryStore);

const liveProducts = computed(() =>
  products.value.filter((product) => product.is_active !== false),
);

const isLoading = computed(
  () => isProductsLoading.value || isCategoriesLoading.value,
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
        eyebrow="Storefront Standards"
        title="Procurement trust signals built into the buying flow."
        description="Review the quality, logistics, and catalog structure signals that shape how Zoom Wide presents materials to serious construction buyers."
      >
        <template #actions>
          <StorefrontButton tone="secondary" size="lg" to="/shop/categories">
            Shop categories
          </StorefrontButton>
          <StorefrontButton tone="primary" size="lg" to="/shop/catalog">
            Browse materials
          </StorefrontButton>
        </template>
      </StorefrontPageHeader>
    </StorefrontPageContainer>

    <StorefrontPageContainer v-if="pageError" size="wide" class="mt-8">
      <StorefrontStateCard
        eyebrow="Standards"
        title="Standards data is temporarily unavailable"
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

    <div v-else-if="isLoading" class="mt-8">
      <ShopHomeTrustSection :product-count="0" :category-count="0" />
    </div>

    <ShopHomeTrustSection
      v-else
      :product-count="totalProducts || liveProducts.length"
      :category-count="totalCategories || categories.length"
    />
  </div>
</template>
