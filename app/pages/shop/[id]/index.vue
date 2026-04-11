<script setup lang="ts">
import { storeToRefs } from "pinia";
import StorefrontPageContainer from "~/components/storefront/StorefrontPageContainer.vue";
import StorefrontStateCard from "~/components/storefront/StorefrontStateCard.vue";
import ShopHomeProductCard from "../_components/ShopHomeProductCard.vue";
import ShopProductHeroCard from "./_components/ShopProductHeroCard.vue";
import ShopProductLoadingState from "./_components/ShopProductLoadingState.vue";

definePageMeta({
  layout: "shop",
});

const route = useRoute();
const productStore = useProductStore();
const categoryStore = useCategoryStore();
const cartStore = useCartStore();

const pageError = ref<string | null>(null);
const isPageLoading = ref(true);
const isRetrying = ref(false);
const quantity = ref(1);
const relatedProductsReady = ref(false);

const productId = computed(() =>
  typeof route.params.id === "string" ? route.params.id : "",
);

const { product, products } = storeToRefs(productStore);
const { categories } = storeToRefs(categoryStore);
const { items, isSyncing } = storeToRefs(cartStore);

const loadPage = async () => {
  if (!productId.value) {
    pageError.value = "No product identifier was provided.";
    isPageLoading.value = false;
    return;
  }

  isPageLoading.value = true;
  relatedProductsReady.value = false;

  const [productResponse, categoriesResponse] = await Promise.all([
    productStore.fetchProductById(productId.value),
    categoryStore.fetchCategories({ page: 1 }),
  ]);

  if (
    productResponse.status !== "success" ||
    categoriesResponse.status !== "success" ||
    !product.value
  ) {
    pageError.value =
      productResponse.message ||
      "The product detail page could not load the selected item.";
    isPageLoading.value = false;
    return;
  }

  const relatedResponse = await productStore.fetchProducts({
    category_id: product.value.category_id || undefined,
    page: 1,
  });

  pageError.value = null;
  relatedProductsReady.value = relatedResponse.status === "success";

  isPageLoading.value = false;
};

await loadPage();

watch(
  productId,
  async () => {
    quantity.value = 1;
    await loadPage();
  },
);

const categoryMap = computed(() =>
  Object.fromEntries(categories.value.map((category) => [category.id, category])),
);

const currentProduct = computed(() => product.value);
const currentCategory = computed(() =>
  currentProduct.value?.category_id
    ? categoryMap.value[currentProduct.value.category_id] ?? null
    : null,
);

const stockQuantity = computed(() => currentProduct.value?.stock_quantity ?? 0);
const minimumStock = computed(() =>
  Math.max(currentProduct.value?.minimum_stock_quantity ?? 1, 1),
);

const currentCartQuantity = computed(() => {
  if (!currentProduct.value?.id) {
    return 0;
  }

  return items.value.find((item) => item.product_id === currentProduct.value?.id)
    ?.quantity ?? 0;
});

const specificationRows = computed(() => {
  const rows = currentProduct.value?.handbook?.specifications ?? [];

  if (rows.length) {
    return rows;
  }

  return [
    {
      label: "SKU",
      value: currentProduct.value?.sku || "Pending catalog update",
    },
    {
      label: "Unit",
      value: currentProduct.value?.unit || "unit",
    },
    {
      label: "Available stock",
      value: String(stockQuantity.value),
    },
    {
      label: "Category",
      value: currentCategory.value?.name || "General supplies",
    },
    {
      label: "Warehouse threshold",
      value: String(minimumStock.value),
    },
  ];
});

const relatedProducts = computed(() =>
  products.value
    .filter(
      (entry) =>
        entry.id &&
        entry.id !== currentProduct.value?.id &&
        entry.is_active !== false,
    )
    .slice(0, 4),
);

const canIncreaseQuantity = computed(
  () =>
    stockQuantity.value > 0 &&
    quantity.value < Math.max(stockQuantity.value, 1),
);

const canDecreaseQuantity = computed(() => quantity.value > 1);

const breadcrumbItems = computed(() => [
  { label: "Shop", to: "/shop" },
  { label: "Catalog", to: "/shop/catalog" },
  currentCategory.value
    ? {
        label: currentCategory.value.name,
        to: {
          path: "/shop/catalog",
          query: {
            category_id: currentCategory.value.id,
          },
        },
      }
    : null,
].filter(Boolean) as Array<{ label: string; to: string | { path: string; query?: Record<string, string> } }>);

useSeoMeta({
  title: () =>
    currentProduct.value?.name
      ? `${currentProduct.value.name} | ZOOM WIDE Construction Supplies`
      : "Product Detail | ZOOM WIDE Construction Supplies",
  description: () =>
    currentProduct.value?.handbook?.summary ||
    currentProduct.value?.description ||
    "Review pricing, stock, and specifications for this ZOOM WIDE product.",
});

const incrementQuantity = () => {
  if (!canIncreaseQuantity.value) {
    return;
  }

  quantity.value += 1;
};

const decrementQuantity = () => {
  if (!canDecreaseQuantity.value) {
    return;
  }

  quantity.value -= 1;
};

const handleRetry = async () => {
  isRetrying.value = true;
  await loadPage();
  isRetrying.value = false;
};

const handleAddToCart = async () => {
  if (!currentProduct.value) {
    return;
  }

  await cartStore.addToCart(currentProduct.value, quantity.value);
};

const handleBuyNow = async () => {
  await handleAddToCart();
  await navigateTo("/checkout");
};

const handleAddRelatedToCart = async (relatedProductId?: string) => {
  if (!relatedProductId) {
    return;
  }

  const related = relatedProducts.value.find((item) => item.id === relatedProductId);

  if (!related) {
    return;
  }

  await cartStore.addToCart(related, 1);
};
</script>

<template>
  <StorefrontPageContainer size="wide" class="py-8 md:py-10">
    <nav
      class="mb-8 flex flex-wrap items-center gap-2 text-[0.7rem] font-semibold uppercase tracking-[0.16em] text-slate-500"
    >
      <template v-for="item in breadcrumbItems" :key="item.label">
        <NuxtLink :to="item.to" class="transition hover:text-slate-900">
          {{ item.label }}
        </NuxtLink>
        <UIcon name="i-lucide-chevron-right" class="text-xs text-slate-400" />
      </template>
      <span class="text-slate-900">
        {{ currentProduct?.name || "Product detail" }}
      </span>
    </nav>

    <ShopProductLoadingState v-if="isPageLoading" />

    <StorefrontStateCard
      v-else-if="pageError || !currentProduct"
      eyebrow="Product"
      title="Product unavailable"
      :description="
        pageError ||
        'This product could not be loaded right now. Try again or return to the catalog.'
      "
      tone="error"
    >
      <template #actions>
        <div class="flex flex-wrap gap-3">
          <StorefrontButton
            tone="danger"
            :loading="isRetrying"
            @click="handleRetry"
          >
            Retry
          </StorefrontButton>
          <StorefrontButton tone="secondary" to="/shop/catalog">
            Back to catalog
          </StorefrontButton>
        </div>
      </template>
    </StorefrontStateCard>

    <template v-else>
      <ShopProductHeroCard
        :product="currentProduct"
        :category-name="currentCategory?.name"
        :quantity="quantity"
        :quantity-in-cart="currentCartQuantity"
        :is-cart-busy="isSyncing"
        @increase="incrementQuantity"
        @decrease="decrementQuantity"
        @add-to-cart="handleAddToCart"
        @buy-now="handleBuyNow"
      />

      <section id="technical-specs" class="mt-16">
        <div class="mb-8">
          <p class="text-[0.72rem] font-semibold uppercase tracking-[0.22em] text-amber-700">
            Product details
          </p>
          <h2 class="mt-3 text-3xl font-semibold leading-tight text-slate-950">
            Description, highlights, and specification detail.
          </h2>
        </div>

        <div class="grid gap-6 xl:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
          <StorefrontSectionCard padding="lg">
            <div class="space-y-6">
              <div>
                <p class="text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-slate-500">
                  Summary
                </p>
                <p class="mt-3 text-sm leading-8 text-slate-600">
                  {{
                    currentProduct.handbook?.summary ||
                    currentProduct.description ||
                    "Review this item against the stock, unit, category, and specification details before adding it to the project cart."
                  }}
                </p>
              </div>

              <div v-if="currentProduct.handbook?.features?.length">
                <p class="text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-slate-500">
                  Key features
                </p>
                <ul class="mt-3 space-y-3 text-sm text-slate-600">
                  <li
                    v-for="feature in currentProduct.handbook.features"
                    :key="feature"
                    class="flex gap-3"
                  >
                    <UIcon
                      name="i-lucide-badge-check"
                      class="mt-0.5 shrink-0 text-amber-600"
                    />
                    <span class="leading-7">{{ feature }}</span>
                  </li>
                </ul>
              </div>

              <div v-if="currentProduct.handbook?.applications?.length">
                <p class="text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-slate-500">
                  Typical applications
                </p>
                <div class="mt-3 flex flex-wrap gap-2">
                  <span
                    v-for="application in currentProduct.handbook.applications"
                    :key="application"
                    class="rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-600"
                  >
                    {{ application }}
                  </span>
                </div>
              </div>
            </div>
          </StorefrontSectionCard>

          <StorefrontSectionCard padding="lg">
            <div class="space-y-1">
              <div
                v-for="row in specificationRows"
                :key="`${row.label}-${row.value}`"
                class="flex flex-col gap-2 border-b border-slate-200 py-4 sm:flex-row sm:items-center sm:justify-between"
              >
                <span
                  class="text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-slate-500"
                >
                  {{ row.label }}
                </span>
                <span class="text-sm font-semibold text-slate-900">
                  {{ row.value }}
                </span>
              </div>
            </div>
          </StorefrontSectionCard>
        </div>
      </section>

      <section v-if="relatedProductsReady && relatedProducts.length" class="mt-16">
        <div class="mb-8 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <p class="text-[0.72rem] font-semibold uppercase tracking-[0.22em] text-amber-700">
              Essential pairings
            </p>
            <h2 class="mt-3 text-3xl font-semibold leading-tight text-slate-950">
              Related products from the same catalog path.
            </h2>
          </div>
          <StorefrontButton tone="secondary" to="/shop/catalog">
            Browse full catalog
          </StorefrontButton>
        </div>

        <div class="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
          <ShopHomeProductCard
            v-for="related in relatedProducts"
            :key="related.id || related.sku || related.name"
            :product="related"
            :category-name="categoryMap[related.category_id || '']?.name"
            :quantity-in-cart="
              related.id
                ? items.find((item) => item.product_id === related.id)?.quantity ?? 0
                : 0
            "
            :disabled="isSyncing"
            @add="handleAddRelatedToCart"
          />
        </div>
      </section>
    </template>
  </StorefrontPageContainer>
</template>
