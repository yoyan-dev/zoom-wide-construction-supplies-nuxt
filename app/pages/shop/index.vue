<script setup lang="ts">
import { storeToRefs } from "pinia";
import { buildInventoryBalanceMap } from "~/utils/inventory-balance";
import { orderItems as seedOrderItems } from "~/seeds/orders";
import {
  storefrontPromoBanners,
  storefrontQuickTerms,
  storefrontSteps,
  storefrontTrustPoints,
} from "./_components/storefront.data";
import StorefrontBestSellers from "./_components/StorefrontBestSellers.vue";
import StorefrontCategoryShortcuts from "./_components/StorefrontCategoryShortcuts.vue";
import StorefrontCtaBanner from "./_components/StorefrontCtaBanner.vue";
import StorefrontFeaturedProducts from "./_components/StorefrontFeaturedProducts.vue";
import StorefrontHero from "./_components/StorefrontHero.vue";
import StorefrontHowItWorks from "./_components/StorefrontHowItWorks.vue";
import StorefrontProductGrid from "./_components/StorefrontProductGrid.vue";
import StorefrontPromoBanners from "./_components/StorefrontPromoBanners.vue";
import StorefrontTrustSection from "./_components/StorefrontTrustSection.vue";

definePageMeta({
  layout: "shop",
});

const route = useRoute();
const router = useRouter();
const productStore = useProductStore();
const categoryStore = useCategoryStore();
const inventoryStore = useInventoryStore();

await Promise.all([
  productStore.fetchProducts(),
  categoryStore.fetchCategories(),
  inventoryStore.fetchInventoryLogs(),
]);

const { products } = storeToRefs(productStore);
const { categories } = storeToRefs(categoryStore);
const { logs } = storeToRefs(inventoryStore);

const search = ref(typeof route.query.q === "string" ? route.query.q : "");

watch(
  () => route.query.q,
  (value) => {
    search.value = typeof value === "string" ? value : "";
  },
  { immediate: true },
);

const applySearch = async () => {
  const query = search.value.trim();
  await router.replace({
    path: "/shop",
    query: query ? { q: query } : {},
  });
};

const activeProducts = computed(() =>
  products.value.filter((product) => product.is_active !== false && product.id),
);

const stockMap = computed(() =>
  buildInventoryBalanceMap(logs.value, activeProducts.value),
);

const categoryCounts = computed(() => {
  const counts: Record<string, number> = {};
  for (const product of activeProducts.value) {
    if (!product.category_id) continue;
    counts[product.category_id] = (counts[product.category_id] ?? 0) + 1;
  }
  return counts;
});

const categoryShortcutItems = computed(() =>
  categories.value
    .map((category) => ({
      category,
      productCount: categoryCounts.value[category.id] ?? 0,
    }))
    .filter((item) => item.productCount > 0)
    .slice(0, 8),
);

const productMap = computed(() => {
  const map: Record<string, typeof activeProducts.value[number]> = {};
  for (const product of activeProducts.value) {
    if (!product.id) continue;
    map[product.id] = product;
  }
  return map;
});

const rankedBestSellerIds = computed(() => {
  const counts: Record<string, number> = {};
  for (const item of seedOrderItems) {
    counts[item.product_id] = (counts[item.product_id] ?? 0) + item.quantity;
  }

  return Object.entries(counts)
    .sort((a, b) => b[1] - a[1])
    .map(([id]) => id);
});

const featuredProductIds = [
  "prod-conc-bag",
  "prod-conc-25mpa",
  "prod-rebar-16",
  "prod-ply-18",
];

const featuredProducts = computed(() =>
  featuredProductIds
    .map((id) => productMap.value[id])
    .filter(Boolean)
    .slice(0, 4),
);

const bestSellerProducts = computed(() =>
  rankedBestSellerIds.value
    .map((id) => productMap.value[id])
    .filter(Boolean)
    .slice(0, 4),
);

const filteredBrowseProducts = computed(() => {
  const term = search.value.trim().toLowerCase();
  if (!term) return activeProducts.value.slice(0, 8);

  return activeProducts.value.filter((product) =>
    [
      product.name ?? "",
      product.sku ?? "",
      product.description ?? "",
      product.category?.name ?? "",
      product.handbook?.summary ?? "",
      ...(product.handbook?.features ?? []),
      ...(product.handbook?.applications ?? []),
    ]
      .join(" ")
      .toLowerCase()
      .includes(term),
  );
});
</script>

<template>
  <div class="min-h-screen">
    <div class="mx-auto max-w-7xl space-y-8 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
      <StorefrontHero
        :search="search"
        :quick-terms="storefrontQuickTerms"
        @update:search="search = $event"
        @search="applySearch"
      />

      <StorefrontCategoryShortcuts :items="categoryShortcutItems" />

      <StorefrontPromoBanners :banners="storefrontPromoBanners" />

      <StorefrontFeaturedProducts
        :products="featuredProducts"
        :stock-map="stockMap"
      />

      <StorefrontBestSellers
        :products="bestSellerProducts"
        :stock-map="stockMap"
      />

      <StorefrontProductGrid
        :products="filteredBrowseProducts"
        :stock-map="stockMap"
      />

      <StorefrontTrustSection :points="storefrontTrustPoints" />

      <StorefrontHowItWorks :steps="storefrontSteps" />

      <StorefrontCtaBanner />
    </div>
  </div>
</template>
