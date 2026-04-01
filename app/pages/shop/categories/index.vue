<script setup lang="ts">
import { storeToRefs } from "pinia";
import ShopStateCard from "../_components/ShopStateCard.vue";
import { storefrontSolutionCards } from "../_data/storefront-content";

definePageMeta({
  layout: "shop",
});

const categoryStore = useCategoryStore();
const productStore = useProductStore();
const isRetrying = ref(false);
const pageError = ref<string | null>(null);

const loadPage = async () => {
  const [categoriesResponse, productsResponse] = await Promise.all([
    categoryStore.fetchCategories(),
    productStore.fetchProducts({ page: 1 }),
  ]);

  pageError.value =
    categoriesResponse.status === "success" && productsResponse.status === "success"
      ? null
      : categoriesResponse.status === "error"
        ? categoriesResponse.message
        : productsResponse.message;
};

await loadPage();

const { categories } = storeToRefs(categoryStore);
const { products, isLoading } = storeToRefs(productStore);

const categoryProductCounts = computed(() =>
  products.value
    .filter((product) => product.is_active !== false)
    .reduce<Record<string, number>>((counts, product) => {
      if (!product.category_id) {
        return counts;
      }

      counts[product.category_id] = (counts[product.category_id] ?? 0) + 1;
      return counts;
    }, {}),
);

const categoriesWithCounts = computed(() =>
  categories.value
    .map((category) => ({
      ...category,
      productCount: categoryProductCounts.value[category.id] ?? 0,
    }))
    .sort(
      (left, right) =>
        right.productCount - left.productCount || left.name.localeCompare(right.name),
    ),
);

const handleRetry = async () => {
  isRetrying.value = true;
  await loadPage();
  isRetrying.value = false;
};
</script>

<template>
  <div class="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-6 sm:px-6 lg:px-8">
    <section
      class="overflow-hidden rounded-xl bg-white/95 p-6 shadow-sm md:p-8"
    >
      <div class="grid gap-6 lg:grid-cols-[minmax(0,1.2fr)_320px] lg:items-end">
        <div>
          <p class="text-xs uppercase tracking-[0.22em] text-amber-600">
            Shop Categories
          </p>
          <h1 class="mt-3 text-3xl font-semibold tracking-tight text-slate-900 md:text-4xl">
            Browse the catalog the same way procurement teams think.
          </h1>
          <p class="mt-3 max-w-3xl text-sm leading-7 text-slate-600 md:text-base">
            Each category gives buyers a fast starting point before they compare exact
            products, stock levels, and prices in the main storefront.
          </p>
        </div>

        <div class="rounded-lg bg-slate-50/80 p-5">
          <p class="text-sm text-slate-500">Current category count</p>
          <p class="mt-2 text-3xl font-semibold text-slate-900">
            {{ categories.length }}
          </p>
          <p class="mt-2 text-sm leading-6 text-slate-600">
            Use this page when customers need structure before they start searching.
          </p>
        </div>
      </div>
    </section>

    <ShopStateCard
      v-if="pageError"
      eyebrow="Shop Categories"
      title="Categories unavailable"
      :description="pageError"
      tone="error"
      action-label="Retry"
      :action-loading="isRetrying"
      @action="handleRetry"
    />

    <template v-else>
      <div
        v-if="isLoading"
        class="grid gap-4 md:grid-cols-2 xl:grid-cols-3"
      >
        <USkeleton
          v-for="index in 6"
          :key="index"
          class="h-[320px] rounded-lg"
        />
      </div>

      <section
        v-else-if="categoriesWithCounts.length"
        class="grid gap-4 md:grid-cols-2 xl:grid-cols-3"
      >
        <NuxtLink
          v-for="category in categoriesWithCounts"
          :key="category.id"
          :to="{ path: '/shop', query: { category: category.id } }"
          class="group rounded-xl bg-white/95 p-5 shadow-sm transition duration-200 hover:-translate-y-1 hover:shadow-md"
        >
          <div
            class="flex h-48 items-center justify-center overflow-hidden rounded-lg bg-[radial-gradient(circle_at_top_left,_rgba(245,158,11,0.16),_transparent_45%),linear-gradient(180deg,#f8fafc_0%,#ffffff_100%)]"
          >
            <NuxtImg
              v-if="category.image_url"
              :src="category.image_url"
              :alt="category.name"
              class="h-full w-full object-cover"
              width="720"
              height="520"
            />
            <div v-else class="text-center">
              <p class="text-xs uppercase tracking-[0.18em] text-slate-500">
                Category
              </p>
              <p class="mt-3 text-4xl font-semibold text-slate-800">
                {{ category.name.slice(0, 1).toUpperCase() }}
              </p>
            </div>
          </div>

          <div class="mt-5 flex items-start justify-between gap-3">
            <div>
              <h2 class="text-xl font-semibold text-slate-900 transition group-hover:text-amber-700">
                {{ category.name }}
              </h2>
              <p class="mt-2 text-sm leading-6 text-slate-600">
                {{ category.overview || category.description }}
              </p>
            </div>
            <UBadge color="warning" variant="subtle">
              {{ category.productCount }}
            </UBadge>
          </div>

          <div class="mt-4 flex flex-wrap gap-2">
            <span
              v-for="spec in category.featured_specs?.slice(0, 2) ?? []"
              :key="`${category.id}-${spec.label}`"
              class="rounded-full bg-slate-100/90 px-3 py-1 text-xs font-medium text-slate-600"
            >
              {{ spec.label }}: {{ spec.value }}
            </span>
          </div>
        </NuxtLink>
      </section>

      <ShopStateCard
        v-else
        eyebrow="Shop Categories"
        title="No categories available"
        description="Categories will appear here once the storefront catalog is configured."
      />

      <section class="rounded-xl bg-white/95 p-6 shadow-sm md:p-8">
        <p class="text-xs uppercase tracking-[0.22em] text-amber-600">
          Next Best Pages
        </p>
        <h2 class="mt-3 text-2xl font-semibold tracking-tight text-slate-900">
          Guide buyers beyond the category listing.
        </h2>

        <div class="mt-6 grid gap-4 md:grid-cols-3">
          <NuxtLink
            v-for="card in storefrontSolutionCards"
            :key="card.title"
            :to="card.href"
            class="rounded-lg bg-slate-50/80 p-5 transition duration-200 hover:bg-amber-50/40"
          >
            <h3 class="text-lg font-semibold text-slate-900">
              {{ card.title }}
            </h3>
            <p class="mt-2 text-sm leading-6 text-slate-600">
              {{ card.description }}
            </p>
            <p class="mt-4 text-sm font-medium text-amber-700">
              {{ card.ctaLabel }}
            </p>
          </NuxtLink>
        </div>
      </section>
    </template>
  </div>
</template>
