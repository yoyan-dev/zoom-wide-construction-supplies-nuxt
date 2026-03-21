<script setup lang="ts">
import { storeToRefs } from "pinia";

definePageMeta({
  layout: "shop",
});

const categoryStore = useCategoryStore();
const productStore = useProductStore();

await Promise.all([
  categoryStore.fetchCategories(),
  productStore.fetchProducts(),
]);

const { categories } = storeToRefs(categoryStore);
const { products } = storeToRefs(productStore);

const productCounts = computed(() => {
  const counts: Record<string, number> = {};
  for (const product of products.value) {
    if (!product.category_id) continue;
    counts[product.category_id] = (counts[product.category_id] ?? 0) + 1;
  }
  return counts;
});
</script>

<template>
  <div class="min-h-screen bg-slate-50">
    <div class="mx-auto max-w-7xl space-y-8 px-4 py-10 sm:px-6 lg:px-8">
      <section class="rounded-[32px] bg-white p-8 shadow-sm ring-1 ring-slate-200/70">
        <p class="text-xs uppercase tracking-[0.2em] text-slate-500">
          Shop Catalog
        </p>
        <h1 class="mt-3 text-3xl font-semibold text-slate-900">
          Browse by Category
        </h1>
        <p class="mt-3 max-w-2xl text-sm leading-6 text-slate-600">
          Explore materials by work type, compare category guidance, and jump into
          products that match your current project needs.
        </p>
      </section>

      <section class="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        <NuxtLink
          v-for="category in categories"
          :key="category.id"
          :to="`/shop/categories/${category.id}`"
          class="overflow-hidden rounded-[28px] bg-white shadow-sm ring-1 ring-slate-200/70 transition hover:-translate-y-0.5 hover:shadow-md"
        >
          <div
            class="flex h-48 items-center justify-center bg-gradient-to-br from-amber-100 via-white to-slate-100 text-5xl font-semibold text-slate-700"
          >
            {{ category.name?.slice(0, 1) ?? "C" }}
          </div>
          <div class="p-6">
            <div class="flex items-start justify-between gap-4">
              <div>
                <p class="text-xs uppercase tracking-[0.18em] text-slate-500">
                  {{ productCounts[category.id] ?? 0 }} products
                </p>
                <h2 class="mt-2 text-xl font-semibold text-slate-900">
                  {{ category.name }}
                </h2>
              </div>
              <UBadge color="info" variant="subtle">
                {{ category.featured_specs?.length ?? 0 }} specs
              </UBadge>
            </div>

            <p class="mt-3 text-sm leading-6 text-slate-600">
              {{ category.overview ?? category.description }}
            </p>

            <div class="mt-5 flex flex-wrap gap-2">
              <UBadge
                v-for="item in (category.typical_uses ?? []).slice(0, 2)"
                :key="item"
                color="neutral"
                variant="subtle"
              >
                {{ item }}
              </UBadge>
            </div>
          </div>
        </NuxtLink>
      </section>
    </div>
  </div>
</template>
