<script setup lang="ts">
import type { Category } from "~/types/category";
import type { Product } from "~/types/product";

const props = defineProps<{
  categories: Category[];
  products: Product[];
}>();

const activeProducts = computed(() =>
  props.products.filter((product) => product.is_active !== false),
);

const productCounts = computed(() =>
  activeProducts.value.reduce<Record<string, number>>((counts, product) => {
    if (!product.category_id) {
      return counts;
    }

    counts[product.category_id] = (counts[product.category_id] ?? 0) + 1;
    return counts;
  }, {}),
);

const featuredCategories = computed(() =>
  props.categories
    .map((category) => ({
      ...category,
      productCount: productCounts.value[category.id] ?? 0,
    }))
    .sort(
      (left, right) =>
        right.productCount - left.productCount || left.name.localeCompare(right.name),
    )
    .slice(0, 6),
);
</script>

<template>
  <section v-if="featuredCategories.length" class="space-y-5">
    <div class="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
      <div class="max-w-2xl">
        <p class="text-xs uppercase tracking-[0.22em] text-amber-600">
          Category Shortcuts
        </p>
        <h2 class="mt-2 text-2xl font-semibold tracking-tight text-slate-900 md:text-3xl">
          Start with the right material family.
        </h2>
        <p class="mt-3 text-sm leading-7 text-slate-600">
          High-volume categories appear first so buyers can narrow down product options
          without scanning the full catalog.
        </p>
      </div>

      <UButton color="neutral" variant="outline" to="/shop/categories">
        Browse all categories
      </UButton>
    </div>

    <div class="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      <NuxtLink
        v-for="category in featuredCategories"
        :key="category.id"
        :to="{ path: '/shop', query: { category: category.id } }"
        class="group rounded-xl bg-white/95 p-5 shadow-sm transition duration-200 hover:-translate-y-1 hover:shadow-md"
      >
        <div
          class="flex h-40 items-center justify-center overflow-hidden rounded-lg bg-[radial-gradient(circle_at_top_left,_rgba(245,158,11,0.16),_transparent_45%),linear-gradient(180deg,#f8fafc_0%,#ffffff_100%)]"
        >
          <NuxtImg
            v-if="category.image_url"
            :src="category.image_url"
            :alt="category.name"
            class="h-full w-full object-cover transition duration-300 group-hover:scale-105"
            width="720"
            height="480"
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

        <div class="mt-4 flex items-start justify-between gap-3">
          <div>
            <p class="text-lg font-semibold text-slate-900 transition group-hover:text-amber-700">
              {{ category.name }}
            </p>
            <p class="mt-2 line-clamp-2 text-sm leading-6 text-slate-600">
              {{ category.overview || category.description }}
            </p>
          </div>
          <UBadge color="warning" variant="subtle">
            {{ category.productCount }} items
          </UBadge>
        </div>

        <div class="mt-4 flex flex-wrap gap-2">
          <span
            v-for="useCase in category.typical_uses?.slice(0, 2) ?? []"
            :key="useCase"
            class="rounded-full bg-slate-100/90 px-3 py-1 text-xs font-medium text-slate-600"
          >
            {{ useCase }}
          </span>
        </div>
      </NuxtLink>
    </div>
  </section>
</template>
