<script setup lang="ts">
import { storeToRefs } from "pinia";
import { formatCurrency } from "~/utils/format";

definePageMeta({
  layout: "shop",
});

const route = useRoute();
const categoryId = computed(() => String(route.params.categoryId));

const categoryStore = useCategoryStore();
const productStore = useProductStore();

await Promise.all([
  categoryStore.fetchCategoryById(categoryId.value),
  productStore.fetchProducts(),
]);

const { category } = storeToRefs(categoryStore);
const { products } = storeToRefs(productStore);

const categoryProducts = computed(() =>
  products.value.filter((product) => product.category_id === categoryId.value),
);
</script>

<template>
  <div class="min-h-screen bg-slate-50">
    <div class="mx-auto max-w-7xl space-y-8 px-4 py-10 sm:px-6 lg:px-8">
      <section
        v-if="category"
        class="overflow-hidden rounded-[32px] bg-white shadow-sm ring-1 ring-slate-200/70"
      >
        <div
          class="flex h-64 items-center justify-center bg-gradient-to-br from-amber-100 via-white to-slate-100 text-6xl font-semibold text-slate-700"
        >
          {{ category.name?.slice(0, 1) ?? "C" }}
        </div>
        <div class="grid gap-6 p-8 xl:grid-cols-[minmax(0,1.15fr)_minmax(320px,0.85fr)]">
          <div>
            <p class="text-xs uppercase tracking-[0.2em] text-slate-500">
              Shop Category
            </p>
            <h1 class="mt-3 text-3xl font-semibold text-slate-900">
              {{ category.name }}
            </h1>
            <p class="mt-4 text-sm leading-7 text-slate-600">
              {{ category.overview ?? category.description }}
            </p>
          </div>

          <div class="grid gap-4">
            <div class="rounded-2xl border border-slate-200/70 p-5">
              <p class="text-xs uppercase tracking-[0.18em] text-slate-500">
                Typical Uses
              </p>
              <ul class="mt-3 grid gap-2 text-sm text-slate-600">
                <li v-for="item in category.typical_uses ?? []" :key="item">
                  {{ item }}
                </li>
              </ul>
            </div>
            <div class="rounded-2xl border border-slate-200/70 p-5">
              <p class="text-xs uppercase tracking-[0.18em] text-slate-500">
                Buying Considerations
              </p>
              <ul class="mt-3 grid gap-2 text-sm text-slate-600">
                <li
                  v-for="item in category.buying_considerations ?? []"
                  :key="item"
                >
                  {{ item }}
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      <section v-if="category" class="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        <div
          v-for="product in categoryProducts"
          :key="product.id"
          class="rounded-[28px] bg-white p-6 shadow-sm ring-1 ring-slate-200/70"
        >
          <div class="flex items-start justify-between gap-4">
            <div>
              <p class="text-xs uppercase tracking-[0.18em] text-slate-500">
                {{ product.sku }}
              </p>
              <h2 class="mt-2 text-xl font-semibold text-slate-900">
                {{ product.name }}
              </h2>
            </div>
            <UBadge color="success" variant="subtle">
              {{ product.unit }}
            </UBadge>
          </div>

          <p class="mt-3 text-sm leading-6 text-slate-600">
            {{ product.handbook?.summary ?? product.description }}
          </p>

          <div class="mt-5 grid gap-3">
            <div
              v-for="spec in (product.handbook?.specifications ?? []).slice(0, 3)"
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
          </div>

          <div class="mt-5 flex items-center justify-between">
            <span class="text-lg font-semibold text-slate-900">
              {{ formatCurrency(product.price) }}
            </span>
            <NuxtLink
              :to="`/shop/product/${product.id}`"
              class="text-sm font-medium text-sky-700"
            >
              View product
            </NuxtLink>
          </div>
        </div>
      </section>

      <UCard v-if="!category">
        <p class="text-sm text-slate-600">
          Category not found. Return to the category listing and choose another one.
        </p>
      </UCard>
    </div>
  </div>
</template>
