<script setup lang="ts">
import { storeToRefs } from "pinia";
import ShopHero from "./_components/ShopHero.vue";
import ShopFilters from "./_components/ShopFilters.vue";
import ShopProductsGrid from "./_components/ShopProductsGrid.vue";
import ShopStateCard from "./_components/ShopStateCard.vue";
import ShopCategorySpotlight from "./_components/ShopCategorySpotlight.vue";
import ShopTrustSection from "./_components/ShopTrustSection.vue";
import ShopProcurementFlow from "./_components/ShopProcurementFlow.vue";
import ShopFaqSection from "./_components/ShopFaqSection.vue";

definePageMeta({
  layout: "shop",
});

const route = useRoute();
const router = useRouter();
const productStore = useProductStore();
const categoryStore = useCategoryStore();
const pageError = ref<string | null>(null);
const isRetrying = ref(false);
const selectedSupplier = ref("all");
const maxPrice = ref<number | null>(null);

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

const categoryCount = computed(() => categories.value.length);
const supplierOptions = computed(() => {
  const suppliers = Array.from(
    new Set(
      products.value
        .map((product) => product.supplier?.name?.trim())
        .filter((supplier): supplier is string => Boolean(supplier)),
    ),
  ).sort((left, right) => left.localeCompare(right));

  return [
    { label: "All suppliers", value: "all" },
    ...suppliers.map((supplier) => ({ label: supplier, value: supplier })),
  ];
});

const maxPriceLimit = computed(() => {
  const prices = products.value
    .map((product) => Number(product.price ?? 0))
    .filter((price) => Number.isFinite(price) && price > 0);

  if (!prices.length) {
    return 0;
  }

  return Math.ceil(Math.max(...prices));
});

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

watch(supplierOptions, (options) => {
  if (!options.some((option) => option.value === selectedSupplier.value)) {
    selectedSupplier.value = "all";
  }
});

watch(maxPriceLimit, (limit) => {
  if (!limit) {
    maxPrice.value = null;
    return;
  }

  if (maxPrice.value !== null && maxPrice.value > limit) {
    maxPrice.value = limit;
  }
});
</script>

<template>
  <div class="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-5 sm:px-6 sm:py-6 lg:px-8">
    <ShopHero
      :total="visibleProductCount"
      :category-count="categoryCount"
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
      <div class="grid gap-5 xl:grid-cols-[300px_minmax(0,1fr)]">
        <ShopFilters
          :category-id="currentCategoryId"
          :category-options="categoryOptions"
          :supplier="selectedSupplier"
          :supplier-options="supplierOptions"
          :max-price="maxPrice"
          :max-price-limit="maxPriceLimit"
          :search="currentSearch"
          @update:category-id="handleCategoryChange"
          @update:supplier="selectedSupplier = $event"
          @update:max-price="maxPrice = $event"
        />

        <ShopProductsGrid
          :products="products"
          :categories="categories"
          :search="currentSearch"
          :active-category-label="activeCategoryLabel"
          :supplier-filter="selectedSupplier"
          :max-price-filter="maxPrice"
          :is-loading="isLoading"
        />
      </div>

      <ShopCategorySpotlight :categories="categories" :products="products" />
      <ShopTrustSection />
      <ShopProcurementFlow />
      <ShopFaqSection />
    </template>
  </div>
</template>
