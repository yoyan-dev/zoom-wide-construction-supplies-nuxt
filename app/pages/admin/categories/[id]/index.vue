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

const { category, categoryMeta } = storeToRefs(categoryStore);
const { products } = storeToRefs(productStore);

const productCount = computed(
  () => products.value.filter((item) => item.category_id === categoryId.value).length,
);
const meta = computed(() => categoryMeta.value[categoryId.value] ?? {});

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
              Category {{ category?.name ?? "Not found" }}
            </h1>
            <p class="mt-2 text-sm text-slate-600">
              Review category setup and performance.
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

      <div v-if="category">
        <UCard>
          <div class="grid gap-4 md:grid-cols-3">
            <div>
              <p class="text-xs uppercase tracking-[0.18em] text-slate-500">
                Status
              </p>
              <p class="mt-2 text-lg font-semibold text-slate-800">
                {{ meta.status ?? "active" }}
              </p>
            </div>
            <div>
              <p class="text-xs uppercase tracking-[0.18em] text-slate-500">
                Products
              </p>
              <p class="mt-2 text-lg font-semibold text-slate-800">
                {{ productCount }}
              </p>
            </div>
            <div>
              <p class="text-xs uppercase tracking-[0.18em] text-slate-500">
                Parent Category
              </p>
              <p class="mt-2 text-lg font-semibold text-slate-800">
                {{ meta.parent_id ?? "None" }}
              </p>
            </div>
          </div>
        </UCard>

        <UCard>
          <div class="grid gap-4 md:grid-cols-2">
            <div>
              <p class="text-xs uppercase tracking-[0.18em] text-slate-500">
                Description
              </p>
              <p class="mt-2 text-sm text-slate-600">
                {{ category.description || "No description available." }}
              </p>
            </div>
            <div>
              <p class="text-xs uppercase tracking-[0.18em] text-slate-500">
                Image URL
              </p>
              <p class="mt-2 text-sm text-slate-600">
                {{ category.image_url || "No image" }}
              </p>
            </div>
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

      <UCard v-else>
        <p class="text-sm text-slate-600">
          Category not found. Check the URL or return to the categories list.
        </p>
      </UCard>
    </div>
  </div>
</template>
