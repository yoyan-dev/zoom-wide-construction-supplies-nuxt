<script setup lang="ts">
import { storeToRefs } from "pinia";
import StorefrontPageHeader from "~/components/storefront/StorefrontPageHeader.vue";
import StorefrontSkeletonGrid from "~/components/storefront/StorefrontSkeletonGrid.vue";
import StorefrontStateCard from "~/components/storefront/StorefrontStateCard.vue";
import { formatCurrency, formatNumber } from "~/utils/format";
import ShopHomeProductCard from "../_components/ShopHomeProductCard.vue";
import ShopCatalogPagination from "./_components/ShopCatalogPagination.vue";
import ShopCatalogSidebar from "./_components/ShopCatalogSidebar.vue";

definePageMeta({
  layout: "shop",
});

useSeoMeta({
  title: "Catalog | ZOOM WIDE Construction Supplies",
  description:
    "Browse the ZOOM WIDE construction supplies catalog with search, category filters, pricing visibility, and pagination-ready product browsing.",
});

const route = useRoute();
const router = useRouter();
const productStore = useProductStore();
const categoryStore = useCategoryStore();
const cartStore = useCartStore();

const searchDraft = ref("");
const pageError = ref<string | null>(null);
const isRetrying = ref(false);

const {
  products,
  isLoading: isProductsLoading,
  totalProducts,
  pagination,
} = storeToRefs(productStore);
const { categories, isLoading: isCategoriesLoading } = storeToRefs(categoryStore);
const { items, isSyncing } = storeToRefs(cartStore);

const currentSearch = computed(() =>
  typeof route.query.q === "string" ? route.query.q.trim() : "",
);

const currentCategoryId = computed(() =>
  typeof route.query.category_id === "string" ? route.query.category_id : "",
);

const currentSort = computed(() => {
  const value =
    typeof route.query.sort === "string" ? route.query.sort : "newest";

  return ["newest", "price-asc", "price-desc", "stock-desc", "name-asc"].includes(
    value,
  )
    ? value
    : "newest";
});

const currentStockFilter = computed(() => {
  const value =
    typeof route.query.stock === "string" ? route.query.stock : "all";

  return ["all", "in-stock", "low-stock", "out-of-stock"].includes(value)
    ? value
    : "all";
});

const currentPage = computed(() => {
  const value = Number(route.query.page ?? 1);
  return Number.isFinite(value) && value > 0 ? Math.floor(value) : 1;
});

const currentMaxPrice = computed<number | null>(() => {
  if (typeof route.query.max_price !== "string") {
    return null;
  }

  const value = Number(route.query.max_price);
  return Number.isFinite(value) && value > 0 ? value : null;
});

const updateCatalogQuery = async (
  partial: Record<string, string | number | null | undefined>,
  options?: { resetPage?: boolean },
) => {
  const nextQuery: Record<string, string> = {};
  const resetPage = options?.resetPage ?? true;

  const source = {
    q: currentSearch.value || undefined,
    category_id: currentCategoryId.value || undefined,
    sort: currentSort.value !== "newest" ? currentSort.value : undefined,
    stock:
      currentStockFilter.value !== "all" ? currentStockFilter.value : undefined,
    max_price:
      currentMaxPrice.value !== null ? String(currentMaxPrice.value) : undefined,
    page: currentPage.value > 1 ? String(currentPage.value) : undefined,
    ...partial,
  };

  for (const [key, value] of Object.entries(source)) {
    if (value === null || value === undefined || value === "") {
      continue;
    }

    nextQuery[key] = String(value);
  }

  if (resetPage) {
    delete nextQuery.page;
  }

  await router.push({
    path: "/shop/catalog",
    query: nextQuery,
  });
};

const loadPage = async () => {
  const [productsResponse, categoriesResponse] = await Promise.all([
    productStore.fetchProducts({
      q: currentSearch.value || undefined,
      category_id: currentCategoryId.value || undefined,
      page: currentPage.value,
    }),
    categoryStore.fetchCategories({ page: 1 }),
  ]);

  pageError.value =
    productsResponse.status === "success" &&
    categoriesResponse.status === "success"
      ? null
      : "The product catalog could not load live inventory data right now. You can retry without losing your current filter state.";
};

await loadPage();

watch(
  () => [currentSearch.value, currentCategoryId.value, currentPage.value],
  async () => {
    await loadPage();
  },
);

watch(
  currentSearch,
  (value) => {
    searchDraft.value = value;
  },
  { immediate: true },
);

const categoryMap = computed(() =>
  Object.fromEntries(categories.value.map((category) => [category.id, category])),
);

const maxAvailablePrice = computed(() => {
  const prices = products.value
    .map((product) => product.price ?? 0)
    .filter((value) => Number.isFinite(value) && value > 0);

  if (!prices.length) {
    return 0;
  }

  return Math.ceil(Math.max(...prices));
});

const filteredProducts = computed(() =>
  products.value.filter((product) => {
    const stockQuantity = product.stock_quantity ?? 0;
    const minimumStock = Math.max(product.minimum_stock_quantity ?? 1, 1);

    if (
      currentStockFilter.value === "in-stock" &&
      stockQuantity <= minimumStock
    ) {
      return false;
    }

    if (
      currentStockFilter.value === "low-stock" &&
      !(stockQuantity > 0 && stockQuantity <= minimumStock)
    ) {
      return false;
    }

    if (currentStockFilter.value === "out-of-stock" && stockQuantity > 0) {
      return false;
    }

    if (
      currentMaxPrice.value !== null &&
      (product.price ?? 0) > currentMaxPrice.value
    ) {
      return false;
    }

    return product.is_active !== false;
  }),
);

const sortedProducts = computed(() => {
  const collection = [...filteredProducts.value];

  switch (currentSort.value) {
    case "price-asc":
      return collection.sort((left, right) => (left.price ?? 0) - (right.price ?? 0));
    case "price-desc":
      return collection.sort((left, right) => (right.price ?? 0) - (left.price ?? 0));
    case "stock-desc":
      return collection.sort(
        (left, right) =>
          (right.stock_quantity ?? 0) - (left.stock_quantity ?? 0),
      );
    case "name-asc":
      return collection.sort((left, right) =>
        (left.name ?? "").localeCompare(right.name ?? ""),
      );
    default:
      return collection.sort(
        (left, right) =>
          new Date(right.created_at ?? 0).getTime() -
          new Date(left.created_at ?? 0).getTime(),
      );
  }
});

const activeCategory = computed(
  () => categoryMap.value[currentCategoryId.value] ?? null,
);

const catalogTitle = computed(() =>
  activeCategory.value
    ? `${activeCategory.value.name} Catalog`
    : "Product Catalog",
);

const catalogDescription = computed(() => {
  if (activeCategory.value) {
    return `Showing live products for ${activeCategory.value.name}. Use the filters to narrow pricing and stock visibility without leaving the catalog.`;
  }

  return "Professional-grade construction materials, tools, and site-ready supplies with cleaner search, filter, and cart actions.";
});

const catalogSummary = computed(() => {
  if (isProductsLoading.value) {
    return "Loading products";
  }

  if (pageError.value) {
    return "Catalog temporarily unavailable";
  }

  if (!sortedProducts.value.length) {
    return "No products match the current filters";
  }

  return `${formatNumber(sortedProducts.value.length)} visible products from ${formatNumber(
    totalProducts.value || sortedProducts.value.length,
  )} total results`;
});

const currentPriceLabel = computed(() =>
  currentMaxPrice.value !== null
    ? formatCurrency(currentMaxPrice.value)
    : maxAvailablePrice.value
      ? formatCurrency(maxAvailablePrice.value)
      : "No price data",
);

const sortOptions = [
  { label: "Newest arrivals", value: "newest" },
  { label: "Price: Low to high", value: "price-asc" },
  { label: "Price: High to low", value: "price-desc" },
  { label: "Stock level", value: "stock-desc" },
  { label: "Name", value: "name-asc" },
] as const;

const cartQuantities = computed<Record<string, number>>(() =>
  Object.fromEntries(items.value.map((item) => [item.product_id, item.quantity])),
);

const hasActiveFilters = computed(
  () =>
    Boolean(
      currentSearch.value ||
        currentCategoryId.value ||
        currentStockFilter.value !== "all" ||
        currentMaxPrice.value !== null,
    ),
);

const visiblePageNumbers = computed(() => {
  const totalPages = pagination.value.totalPages ?? 1;

  if (totalPages <= 1) {
    return [];
  }

  const pages = new Set<number>([1, totalPages, currentPage.value]);

  for (let offset = 1; offset <= 1; offset += 1) {
    pages.add(Math.max(1, currentPage.value - offset));
    pages.add(Math.min(totalPages, currentPage.value + offset));
  }

  return [...pages].sort((left, right) => left - right);
});

const handleSearchSubmit = async () => {
  await updateCatalogQuery({
    q: searchDraft.value.trim() || null,
  });
};

const handleRetry = async () => {
  isRetrying.value = true;
  await loadPage();
  isRetrying.value = false;
};

const handleAddToCart = async (productId?: string) => {
  if (!productId) {
    return;
  }

  const product = products.value.find((item) => item.id === productId);

  if (!product) {
    return;
  }

  await cartStore.addToCart(product, 1);
};

const handlePageChange = async (page: number) => {
  if (page === currentPage.value) {
    return;
  }

  await updateCatalogQuery({ page }, { resetPage: false });
};

const handleResetFilters = async () => {
  searchDraft.value = "";

  await router.push({
    path: "/shop/catalog",
  });
};
</script>

<template>
  <StorefrontPageContainer size="wide" class="py-8 md:py-10">
    <StorefrontPageHeader
      eyebrow="Catalog"
      :title="catalogTitle"
      :description="catalogDescription"
    >
      <template #actions>
        <div class="rounded-xl border border-slate-200/80 bg-white px-4 py-3 text-left shadow-sm">
          <p class="text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-slate-500">
            Catalog status
          </p>
          <p class="mt-1 text-sm font-semibold text-slate-900">
            {{ catalogSummary }}
          </p>
        </div>
      </template>
    </StorefrontPageHeader>

    <div class="mt-6 grid gap-6 lg:grid-cols-[300px_minmax(0,1fr)] xl:grid-cols-[320px_minmax(0,1fr)]">
      <ShopCatalogSidebar
        :categories="categories"
        :active-category-id="currentCategoryId"
        :stock-filter="currentStockFilter"
        :max-price="currentMaxPrice"
        :max-price-limit="maxAvailablePrice"
        :is-loading="isCategoriesLoading"
        @update:category-id="updateCatalogQuery({ category_id: $event || null })"
        @update:stock-filter="updateCatalogQuery({ stock: $event === 'all' ? null : $event })"
        @update:max-price="
          updateCatalogQuery({
            max_price:
              $event !== null && $event < maxAvailablePrice ? String($event) : null,
          })
        "
        @reset="handleResetFilters"
      />

      <div class="space-y-6">
        <StorefrontSectionCard padding="lg">
          <div class="flex flex-col gap-4">
            <div class="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
              <form class="flex flex-1 items-center gap-3" @submit.prevent="handleSearchSubmit">
                <StorefrontInput
                  v-model="searchDraft"
                  icon="i-lucide-search"
                  placeholder="Search products, SKUs, and specification notes"
                />
                <StorefrontButton type="submit" tone="primary">
                  Search
                </StorefrontButton>
              </form>

              <div class="flex items-center gap-3">
                <span class="text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-slate-500">
                  Sort by
                </span>
                <USelect
                  :items="sortOptions"
                  value-key="value"
                  label-key="label"
                  :model-value="currentSort"
                  class="w-52"
                  @update:model-value="
                    updateCatalogQuery({
                      sort: $event === 'newest' ? null : String($event),
                    })
                  "
                />
              </div>
            </div>

            <div class="flex flex-wrap items-center gap-2">
              <UBadge color="warning" variant="soft">
                {{ catalogSummary }}
              </UBadge>
              <UBadge v-if="activeCategory" color="neutral" variant="subtle">
                Category: {{ activeCategory.name }}
              </UBadge>
              <UBadge
                v-if="currentStockFilter !== 'all'"
                color="neutral"
                variant="subtle"
              >
                Stock: {{ currentStockFilter }}
              </UBadge>
              <UBadge v-if="currentMaxPrice !== null" color="neutral" variant="subtle">
                Max price: {{ currentPriceLabel }}
              </UBadge>
              <StorefrontButton
                v-if="hasActiveFilters"
                tone="ghost"
                size="sm"
                @click="handleResetFilters"
              >
                Clear filters
              </StorefrontButton>
            </div>
          </div>
        </StorefrontSectionCard>

        <StorefrontStateCard
          v-if="pageError"
          eyebrow="Catalog"
          title="Products unavailable"
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

        <StorefrontSkeletonGrid
          v-else-if="isProductsLoading"
          :count="6"
          columns-class="grid gap-5 md:grid-cols-2 2xl:grid-cols-3"
        />

        <StorefrontStateCard
          v-else-if="!sortedProducts.length"
          eyebrow="Catalog"
          title="No products match the current filter set."
          description="Try broadening the search terms, changing the stock filter, or clearing the price cap to see more catalog results."
        >
          <template v-if="hasActiveFilters" #actions>
            <StorefrontButton tone="secondary" @click="handleResetFilters">
              Reset filters
            </StorefrontButton>
          </template>
        </StorefrontStateCard>

        <div v-else class="grid gap-5 md:grid-cols-2 2xl:grid-cols-3">
          <ShopHomeProductCard
            v-for="product in sortedProducts"
            :key="product.id || product.sku || product.name"
            :product="product"
            :category-name="categoryMap[product.category_id || '']?.name"
            :quantity-in-cart="cartQuantities[product.id || ''] ?? 0"
            :disabled="isSyncing"
            @add="handleAddToCart"
          />
        </div>

        <ShopCatalogPagination
          v-if="!pageError && (pagination.totalPages ?? 0) > 1"
          :current-page="currentPage"
          :total-pages="pagination.totalPages || 1"
          :pages="visiblePageNumbers"
          @change="handlePageChange"
        />
      </div>
    </div>
  </StorefrontPageContainer>
</template>
