<script setup lang="ts">
import { storeToRefs } from "pinia";

definePageMeta({
  layout: "admin",
});

const route = useRoute();
const router = useRouter();
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

function goBack() {
  router.push("/admin/products");
}

function editProduct() {
  router.push(`/admin/products/${productId.value}/edit`);
}
</script>

<template>
  <div class="p-6 w-full mx-auto space-y-6">
    <div class="flex justify-between items-center w-full">
      <div>
        <h1 class="text-2xl font-bold">{{ product?.name }}</h1>
        <p class="text-sm text-gray-500">Product Details</p>
      </div>

      <div class="flex gap-2">
        <UButton color="neutral" variant="soft" @click="goBack"> Back </UButton>

        <UButton color="primary" @click="editProduct"> Edit </UButton>
      </div>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 w-full">
      <UCard class="w-full">
        <div class="flex justify-center">
          <img
            v-if="product?.image_url"
            :src="product.image_url"
            class="rounded-lg object-cover w-full max-h-80"
          />

          <div
            v-else
            class="w-full h-60 flex items-center justify-center text-gray-400"
          >
            No Image
          </div>
        </div>
      </UCard>

      <UCard class="lg:col-span-2 space-y-4 w-full">
        <div class="grid grid-cols-2 gap-4">
          <div>
            <p class="text-xs text-gray-500">SKU</p>
            <p class="font-medium">{{ product?.sku }}</p>
          </div>

          <div>
            <p class="text-xs text-gray-500">Unit</p>
            <p class="font-medium">{{ product?.unit }}</p>
          </div>

          <div>
            <p class="text-xs text-gray-500">Category</p>
            <p class="font-medium">
              {{ product?.category?.name || "N/A" }}
            </p>
          </div>

          <div>
            <p class="text-xs text-gray-500">Supplier</p>
            <p class="font-medium">
              {{ product?.supplier?.name || "N/A" }}
            </p>
          </div>

          <div>
            <p class="text-xs text-gray-500">Price</p>
            <p class="font-medium">₱{{ product?.price?.toLocaleString() }}</p>
          </div>

          <div>
            <p class="text-xs text-gray-500">Stock</p>
            <p class="font-medium">
              {{ product?.stock_quantity }}
            </p>
          </div>

          <div>
            <p class="text-xs text-gray-500">Minimum Stock</p>
            <p class="font-medium">
              {{ product?.minimum_stock_quantity }}
            </p>
          </div>

          <div>
            <p class="text-xs text-gray-500">Status</p>

            <UBadge
              :color="product?.is_active ? 'success' : 'danger'"
              variant="soft"
            >
              {{ product?.is_active ? "Active" : "Inactive" }}
            </UBadge>
          </div>
        </div>

        <UDivider />

        <!-- Description -->
        <div>
          <p class="text-xs text-gray-500 mb-1">Description</p>
          <p class="text-sm text-gray-700">
            {{ product?.description || "No description available." }}
          </p>
        </div>
      </UCard>
    </div>

    <!-- Metadata -->
    <UCard>
      <div class="grid grid-cols-2 gap-4 text-sm">
        <div>
          <p class="text-gray-500 text-xs">Created At</p>
          <p>{{ product?.created_at }}</p>
        </div>

        <div>
          <p class="text-gray-500 text-xs">Last Updated</p>
          <p>{{ product?.updated_at }}</p>
        </div>
      </div>
    </UCard>
  </div>
</template>
