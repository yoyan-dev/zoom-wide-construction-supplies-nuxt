<script setup lang="ts">
import { storeToRefs } from "pinia";
import ProductForm from "../../_components/ProductForm.vue";

definePageMeta({
  layout: "admin",
});

const route = useRoute();
const productId = computed(() => String(route.params.id));

const productStore = useProductStore();
const categoryStore = useCategoryStore();
const supplierStore = useSupplierStore();

await Promise.all([
  productStore.fetchProductById(productId.value),
  categoryStore.fetchCategories(),
  supplierStore.fetchSuppliers(),
]);

const { product } = storeToRefs(productStore);
const { categories } = storeToRefs(categoryStore);
const { suppliers } = storeToRefs(supplierStore);

const handleSubmit = (payload: Record<string, unknown>) => {
  console.info("Update product payload", payload);
};
</script>

<template>
  <div class="min-h-screen">
    <div class="space-y-6">
      <section class="bg-white dark:bg-gray-800 p-2">
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
