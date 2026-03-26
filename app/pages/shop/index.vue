<script setup lang="ts">
import { storeToRefs } from "pinia";
import ShopHero from "./_components/ShopHero.vue";
import ShopFilters from "./_components/ShopFilters.vue";
import ShopProductsGrid from "./_components/ShopProductsGrid.vue";
import ShopStateCard from "./_components/ShopStateCard.vue";

definePageMeta({
  layout: "shop",
});

const route = useRoute();
const router = useRouter();
const productStore = useProductStore();
const categoryStore = useCategoryStore();
const pageError = ref<string | null>(null);
const isRetrying = ref(false);

const currentSearch = computed(() =>
  typeof route.query.q === "string" ? route.query.q : "",
);

const currentCategoryId = computed(() =>
  typeof route.query.category === "string" ? route.query.category : "all",
);

const loadPage = async () => {
  const categoryId =
    currentCategoryId.value !== "all" ? currentCategoryId.value : undefined;

  const [productsResponse, categoriesResponse] = await Promise.all([
    productStore.fetchProducts({
      q: currentSearch.value || undefined,
      category_id: categoryId,
      page: 1,
    }),
    categoryStore.fetchCategories(),
  ]);

  pageError.value =
    productsResponse.status === "success" && categoriesResponse.status === "success"
      ? null
      : productsResponse.status === "error"
        ? productsResponse.message
        : categoriesResponse.message;
};

await loadPage();

watch([currentSearch, currentCategoryId], async () => {
  await loadPage();
});

const { products, isLoading } = storeToRefs(productStore);
const { categories } = storeToRefs(categoryStore);

const visibleProductCount = computed(
  () => products.value.filter((product) => product.is_active !== false).length,
);

const categoryOptions = computed(() => [
  { label: "All categories", value: "all" },
  ...categories.value.map((category) => ({
    label: category.name,
    value: category.id,
  })),
]);

const activeCategoryLabel = computed(() => {
  if (currentCategoryId.value === "all") {
    return "All categories";
  }

  return (
    categories.value.find((category) => category.id === currentCategoryId.value)
      ?.name ?? "Selected category"
  );
});

const handleCategoryChange = async (value: string) => {
  if (value === currentCategoryId.value) {
    return;
  }

  const nextQuery: Record<string, string> = {};

  if (currentSearch.value) {
    nextQuery.q = currentSearch.value;
  }

  if (value !== "all") {
    nextQuery.category = value;
  }

  await router.push({
    path: "/shop",
    query: nextQuery,
  });
};

const handleRetry = async () => {
  isRetrying.value = true;
  await loadPage();
  isRetrying.value = false;
};
</script>

<template>
  <div class="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-6 sm:px-6 lg:px-8">
    <ShopHero
      :total="visibleProductCount"
      :search="currentSearch"
      :active-category-label="activeCategoryLabel"
    />

    <template v-if="pageError">
      <ShopStateCard
        eyebrow="Storefront"
        title="Products unavailable"
        :description="pageError"
        tone="error"
        action-label="Retry"
        :action-loading="isRetrying"
        @action="handleRetry"
      />
    </template>
    <template v-else>
      <ShopFilters
        :category-id="currentCategoryId"
        :category-options="categoryOptions"
        :search="currentSearch"
        @update:category-id="handleCategoryChange"
      />
      <ShopProductsGrid
        :products="products"
        :categories="categories"
        :search="currentSearch"
        :is-loading="isLoading"
      />
    </template>
  </div>
</template>
