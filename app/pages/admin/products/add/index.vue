<script setup lang="ts">
import { storeToRefs } from "pinia";
import type { Product } from "~/types/product";
import ProductForm from "../_components/ProductForm.vue";

definePageMeta({
  layout: "admin",
});

const categoryStore = useCategoryStore();
const supplierStore = useSupplierStore();
const productStore = useProductStore();
const router = useRouter();

await Promise.all([
  categoryStore.fetchCategories(),
  supplierStore.fetchSuppliers(),
]);

const { categories } = storeToRefs(categoryStore);
const { suppliers } = storeToRefs(supplierStore);

type ProductDraft = Omit<Product, "id" | "created_at" | "updated_at">;

const handleSubmit = async (payload: ProductDraft) => {
  await productStore.createProduct(payload);
  router.push("/admin/products");
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
            <h1 class="mt-2 text-2xl font-semibold">Add Product</h1>
            <p class="mt-2 text-sm text-slate-600">
              Create a new SKU with pricing, stock, and supplier details.
            </p>
          </div>
          <UButton color="neutral" variant="outline" to="/admin/products">
            Back to Products
          </UButton>
        </div>
      </section>

      <ProductForm
        :product="null"
        :categories="categories"
        :suppliers="suppliers"
        submit-label="Add Product"
        cancel-to="/admin/products"
        @submit="handleSubmit"
      />
    </div>
  </div>
</template>
