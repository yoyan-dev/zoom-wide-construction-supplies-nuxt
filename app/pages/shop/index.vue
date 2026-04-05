<script setup lang="ts">
import { storeToRefs } from "pinia";
import StorefrontStateCard from "~/components/storefront/StorefrontStateCard.vue";
import ShopHomeCategoryGrid from "./_components/ShopHomeCategoryGrid.vue";
import ShopHomeFeaturedProducts from "./_components/ShopHomeFeaturedProducts.vue";
import ShopHomeHero from "./_components/ShopHomeHero.vue";
import ShopHomeTrustSection from "./_components/ShopHomeTrustSection.vue";

definePageMeta({
  layout: "shop",
});

useSeoMeta({
  title: "Shop | ZOOM WIDE Construction Supplies",
  description:
    "Explore featured construction materials, trusted categories, and specification-ready products from ZOOM WIDE.",
});

const route = useRoute();
const router = useRouter();
const productStore = useProductStore();
const categoryStore = useCategoryStore();
const cartStore = useCartStore();

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
      : "The storefront home could not load all live catalog data right now. You can retry without losing the rest of the page.";
};

await loadPage();

const {
  products,
  isLoading: isProductsLoading,
  totalProducts,
} = storeToRefs(productStore);
const {
  categories,
  isLoading: isCategoriesLoading,
  totalCategories,
} = storeToRefs(categoryStore);
const { items, isSyncing } = storeToRefs(cartStore);

const searchQuery = computed(() =>
  typeof route.query.q === "string" ? route.query.q.trim().toLowerCase() : "",
);

const activeCategoryId = computed(() =>
  typeof route.query.category_id === "string" ? route.query.category_id : "",
);

const activeCategory = computed(
  () =>
    categories.value.find((category) => category.id === activeCategoryId.value) ??
    null,
);

const liveProducts = computed(() =>
  products.value.filter((product) => product.is_active !== false),
);

const matchesSearch = (value: string, search: string) =>
  value.toLowerCase().includes(search);

const filteredProducts = computed(() =>
  liveProducts.value.filter((product) => {
    const matchesCategory = activeCategoryId.value
      ? product.category_id === activeCategoryId.value
      : true;

    if (!matchesCategory) {
      return false;
    }

    if (!searchQuery.value) {
      return true;
    }

    return [
      product.name,
      product.sku,
      product.description,
      product.handbook?.summary,
      ...(product.handbook?.features ?? []),
      ...(product.handbook?.applications ?? []),
      ...(product.handbook?.specifications ?? []).flatMap((item) => [
        item.label,
        item.value,
      ]),
    ].some((entry) =>
      typeof entry === "string" ? matchesSearch(entry, searchQuery.value) : false,
    );
  }),
);

const featuredProducts = computed(() => filteredProducts.value.slice(0, 4));

const featuredCategories = computed(() => {
  const selected = activeCategory.value
    ? categories.value.filter((category) => category.id === activeCategory.value?.id)
    : [];
  const remaining = categories.value.filter(
    (category) => category.id !== activeCategory.value?.id,
  );

  return [...selected, ...remaining].slice(0, 4);
});

const featuredProduct = computed(
  () => featuredProducts.value[0] ?? liveProducts.value[0] ?? null,
);

const heroStats = computed(() => [
  {
    label: "Active products",
    value: String(totalProducts.value || liveProducts.value.length || 0),
  },
  {
    label: "Core categories",
    value: String(totalCategories.value || categories.value.length || 0),
  },
  {
    label: "Cart-ready items",
    value: String(items.value.length),
  },
]);

const cartQuantities = computed<Record<string, number>>(() =>
  Object.fromEntries(
    items.value.map((item) => [item.product_id, item.quantity]),
  ),
);

const hasFilters = computed(
  () => Boolean(searchQuery.value || activeCategoryId.value),
);

const clearFilters = async () => {
  await router.push({
    path: "/shop",
    hash: "#featured",
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

  const product = liveProducts.value.find((item) => item.id === productId);

  if (!product) {
    return;
  }

  await cartStore.addToCart(product, 1);
};
</script>

<template>
  <div class="pb-20 md:pb-24">
    <ShopHomeHero
      :stats="heroStats"
      :featured-product-name="featuredProduct?.name"
      :featured-product-image="featuredProduct?.image_url"
    />

    <StorefrontPageContainer v-if="pageError" size="wide" class="mt-8">
      <StorefrontStateCard
        eyebrow="Storefront"
        title="Live catalog data is temporarily unavailable"
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
      :categories="featuredCategories"
      :is-loading="isCategoriesLoading"
      :active-category-id="activeCategoryId"
    />

    <ShopHomeFeaturedProducts
      :products="featuredProducts"
      :is-loading="isProductsLoading"
      :active-category-name="activeCategory?.name"
      :search-query="searchQuery"
      :cart-quantities="cartQuantities"
      :is-cart-busy="isSyncing"
      :has-filters="hasFilters"
      @add-to-cart="handleAddToCart"
      @clear-filters="clearFilters"
    />

    <ShopHomeTrustSection
      :product-count="totalProducts || liveProducts.length"
      :category-count="totalCategories || categories.length"
    />
  </div>
</template>
