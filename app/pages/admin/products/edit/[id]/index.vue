<script setup lang="ts">
import type { Category } from "~/types/category";
import type { Product } from "~/types/product";
import type { Supplier } from "~/types/supplier";
import ProductForm from "../../_components/ProductForm.vue";

definePageMeta({
  layout: "admin",
});

type ProductsResponse =
  | {
      products: Product[];
      categories: Category[];
      suppliers: Supplier[];
    }
  | Product[];

const route = useRoute();
const productId = computed(() => String(route.params.id));

const { data } = await useFetch<ProductsResponse>("/api/admin/products");

const products = computed(() =>
  Array.isArray(data.value) ? data.value : (data.value?.products ?? []),
);
const categories = computed(() =>
  Array.isArray(data.value) ? [] : (data.value?.categories ?? []),
);
const suppliers = computed(() =>
  Array.isArray(data.value) ? [] : (data.value?.suppliers ?? []),
);

const product = computed(
  () => products.value.find((item) => item.id === productId.value) ?? null,
);

const handleSubmit = (payload: Record<string, unknown>) => {
  console.info("Update product payload", payload);
};
</script>

<template>
  <div class="min-h-screen p-6">
    <div class="space-y-6">
      <section class="bg-white dark:bg-gray-800 p-6">
        <div
          class="flex flex-col gap-4 md:flex-row md:items-center md:justify-between"
        >
          <div>
            <p class="text-xs uppercase tracking-[0.18em] text-slate-500">
              Catalog Management
            </p>
            <h1 class="mt-2 text-2xl font-semibold">Edit Product</h1>
            <p class="mt-2 text-sm text-slate-600">
              Update pricing, stock, and catalog visibility for this SKU.
            </p>
          </div>
          <UButton color="neutral" variant="outline" to="/admin/products">
            Back to Products
          </UButton>
        </div>
      </section>

      <div v-if="product">
        <ProductForm
          :product="product"
          :categories="categories"
          :suppliers="suppliers"
          submit-label="Save Changes"
          cancel-to="/admin/products"
          @submit="handleSubmit"
        />
      </div>
      <UCard v-else>
        <p class="text-sm text-slate-600">
          Product not found. Check the URL or return to the products list.
        </p>
      </UCard>
    </div>
  </div>
</template>
