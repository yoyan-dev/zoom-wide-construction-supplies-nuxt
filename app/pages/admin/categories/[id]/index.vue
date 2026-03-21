<script setup lang="ts">
import { storeToRefs } from "pinia";
import { formatLongDate } from "~/utils/format";

definePageMeta({
  layout: "admin",
});

const route = useRoute();
const router = useRouter();
const categoryId = computed(() => String(route.params.id));

const categoryStore = useCategoryStore();
const productStore = useProductStore();

await Promise.all([
  categoryStore.fetchCategoryById(categoryId.value),
  productStore.fetchProducts(),
]);

const { category } = storeToRefs(categoryStore);
const { products } = storeToRefs(productStore);

const linkedProducts = computed(() =>
  products.value.filter((item) => item.category_id === categoryId.value),
);

const goBack = () => router.push("/admin/categories");
const editCategory = () => router.push(`/admin/categories/edit/${categoryId.value}`);
</script>

<template>
  <div class="min-h-screen">
    <div class="space-y-6">
      <section class="bg-white p-2">
        <div
          class="flex flex-col gap-4 md:flex-row md:items-center md:justify-between"
        >
          <div>
            <p class="text-xs uppercase tracking-[0.18em] text-slate-500">
              Catalog Structure
            </p>
            <h1 class="mt-2 text-2xl font-semibold">
              {{ category?.name ?? "Category not found" }}
            </h1>
            <p class="mt-2 text-sm text-slate-600">
              Review category handbook guidance, connected products, and visual setup.
            </p>
          </div>
          <div class="flex flex-wrap items-center gap-2">
            <UButton color="neutral" variant="outline" @click="goBack">
              Back to Categories
            </UButton>
            <UButton color="primary" @click="editCategory">
              Edit Category
            </UButton>
          </div>
        </div>
      </section>

      <div v-if="category" class="space-y-6">
        <div class="grid gap-6 xl:grid-cols-[minmax(0,1.2fr)_minmax(320px,0.9fr)]">
          <UCard>
            <div
              class="flex h-64 items-center justify-center rounded-[28px] border border-slate-200/70 bg-gradient-to-br from-slate-100 via-white to-amber-50"
            >
              <div class="text-center">
                <p class="text-xs uppercase tracking-[0.18em] text-slate-500">
                  Category
                </p>
                <p class="mt-3 text-5xl font-semibold text-slate-800">
                  {{ category.name?.slice(0, 1) ?? "C" }}
                </p>
              </div>
            </div>
            <div class="mt-6 grid gap-4 md:grid-cols-3">
              <div>
                <p class="text-xs uppercase tracking-[0.18em] text-slate-500">
                  Products
                </p>
                <p class="mt-2 text-lg font-semibold text-slate-800">
                  {{ linkedProducts.length }}
                </p>
              </div>
              <div>
                <p class="text-xs uppercase tracking-[0.18em] text-slate-500">
                  Typical Uses
                </p>
                <p class="mt-2 text-lg font-semibold text-slate-800">
                  {{ category.typical_uses?.length ?? 0 }}
                </p>
              </div>
              <div>
                <p class="text-xs uppercase tracking-[0.18em] text-slate-500">
                  Featured Specs
                </p>
                <p class="mt-2 text-lg font-semibold text-slate-800">
                  {{ category.featured_specs?.length ?? 0 }}
                </p>
              </div>
            </div>
          </UCard>

          <UCard>
            <p class="text-xs uppercase tracking-[0.18em] text-slate-500">
              Overview
            </p>
            <h2 class="mt-2 text-xl font-semibold text-slate-900">
              Category Guidance
            </h2>
            <p class="mt-3 text-sm leading-6 text-slate-700">
              {{ category.overview ?? category.description }}
            </p>

            <div class="mt-6 grid gap-4 sm:grid-cols-2">
              <div>
                <p class="text-xs uppercase tracking-[0.18em] text-slate-500">
                  Created
                </p>
                <p class="mt-2 text-sm text-slate-600">
                  {{ formatLongDate(category.created_at) }}
                </p>
              </div>
              <div>
                <p class="text-xs uppercase tracking-[0.18em] text-slate-500">
                  Updated
                </p>
                <p class="mt-2 text-sm text-slate-600">
                  {{ formatLongDate(category.updated_at) }}
                </p>
              </div>
            </div>
          </UCard>
        </div>

        <div class="grid gap-6 lg:grid-cols-3">
          <UCard>
            <p class="text-xs uppercase tracking-[0.18em] text-slate-500">
              Typical Uses
            </p>
            <ul class="mt-4 grid gap-2 text-sm text-slate-600">
              <li v-for="item in category.typical_uses ?? []" :key="item">
                {{ item }}
              </li>
              <li v-if="!(category.typical_uses?.length)" class="text-slate-400">
                No usage notes available.
              </li>
            </ul>
          </UCard>

          <UCard>
            <p class="text-xs uppercase tracking-[0.18em] text-slate-500">
              Buying Considerations
            </p>
            <ul class="mt-4 grid gap-2 text-sm text-slate-600">
              <li
                v-for="item in category.buying_considerations ?? []"
                :key="item"
              >
                {{ item }}
              </li>
              <li
                v-if="!(category.buying_considerations?.length)"
                class="text-slate-400"
              >
                No buying notes available.
              </li>
            </ul>
          </UCard>

          <UCard>
            <p class="text-xs uppercase tracking-[0.18em] text-slate-500">
              Featured Specifications
            </p>
            <div class="mt-4 grid gap-3">
              <div
                v-for="spec in category.featured_specs ?? []"
                :key="spec.label"
                class="rounded-2xl border border-slate-200/70 p-4"
              >
                <p class="text-[11px] uppercase tracking-[0.18em] text-slate-500">
                  {{ spec.label }}
                </p>
                <p class="mt-2 font-medium text-slate-800">
                  {{ spec.value }}
                </p>
              </div>
              <p
                v-if="!(category.featured_specs?.length)"
                class="text-sm text-slate-400"
              >
                No featured specifications available.
              </p>
            </div>
          </UCard>
        </div>

        <UCard>
          <div class="flex items-center justify-between gap-4">
            <div>
              <p class="text-xs uppercase tracking-[0.18em] text-slate-500">
                Connected Products
              </p>
              <h2 class="mt-2 text-lg font-semibold text-slate-900">
                Products in this category
              </h2>
            </div>
            <UBadge color="info" variant="subtle">
              {{ linkedProducts.length }} items
            </UBadge>
          </div>

          <div class="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            <NuxtLink
              v-for="product in linkedProducts"
              :key="product.id"
              :to="`/admin/products/${product.id}`"
              class="rounded-2xl border border-slate-200/70 p-4 transition hover:border-slate-300 hover:bg-slate-50"
            >
              <p class="font-medium text-slate-900">{{ product.name }}</p>
              <p class="mt-1 text-sm text-slate-500">{{ product.sku }}</p>
              <p class="mt-3 text-sm text-slate-600">
                {{ product.handbook?.summary ?? product.description ?? "No summary" }}
              </p>
            </NuxtLink>
            <p v-if="!linkedProducts.length" class="text-sm text-slate-400">
              No products are currently assigned to this category.
            </p>
          </div>
        </UCard>
      </div>

      <UCard v-else>
        <p class="text-sm text-slate-600">
          Category not found. Check the URL or return to the categories list.
        </p>
      </UCard>
    </div>
  </div>
</template>
