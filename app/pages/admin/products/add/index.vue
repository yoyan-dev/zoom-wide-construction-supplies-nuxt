<script setup lang="ts">
import { storeToRefs } from "pinia";
import AdminPageHeader from "../../_components/AdminPageHeader.vue";
import AdminPageStateCard from "../../_components/AdminPageStateCard.vue";
import ProductForm from "../_components/ProductForm.vue";
import { useAdminPageLoadState } from "~/composables/admin/useAdminPageLoadState";
import { useAdminResponseToast } from "~/composables/admin/useAdminResponseToast";

definePageMeta({
  layout: "admin",
});

const categoryStore = useCategoryStore();
const warehouseStore = useWarehouseStore();
const productStore = useProductStore();
const { notifyResponse } = useAdminResponseToast();
const { getLoadErrorMessage } = useAdminPageLoadState();
const pageError = ref<string | null>(null);
const isRetrying = ref(false);

const loadPage = async () => {
  const [categoriesResponse, warehousesResponse] = await Promise.all([
    categoryStore.fetchCategories(),
    warehouseStore.fetchWarehouses(),
  ]);

  pageError.value =
    categoriesResponse.status === "success" &&
    warehousesResponse.status === "success"
      ? null
      : getLoadErrorMessage(
          [categoriesResponse, warehousesResponse],
          "The product form could not be prepared right now.",
        );
};

await loadPage();

const { categories } = storeToRefs(categoryStore);
const { warehouses } = storeToRefs(warehouseStore);

const handleCancel = async () => {
  await navigateTo("/admin/products");
};

const handleSubmit = async (formData: FormData) => {
  const response = await productStore.addProduct(formData);

  if (
    !notifyResponse(response, {
      successTitle: "Product created",
      successDescription: "The new product has been added to the catalog.",
      errorTitle: "Product not created",
    })
  ) {
    return;
  }

  await navigateTo("/admin/products");
};

const handleRetry = async () => {
  isRetrying.value = true;
  await loadPage();
  isRetrying.value = false;
};
</script>

<template>
  <div class="min-h-screen">
    <div class="space-y-6">
      <AdminPageHeader
        eyebrow="Catalog Management"
        title="Add Product"
        description="Create a new SKU with pricing and stock details."
        action-label="Back to Products"
        action-icon="i-lucide-arrow-left"
        action-color="neutral"
        action-to="/admin/products"
      />

      <AdminPageStateCard
        v-if="pageError"
        eyebrow="Product Form"
        title="Product form unavailable"
        :description="pageError"
        tone="error"
        action-label="Retry"
        :action-loading="isRetrying"
        @action="handleRetry"
      />

      <ProductForm
        v-else
        :categories="categories"
        :warehouses="warehouses"
        submit-label="Create Product"
        :is-submitting="productStore.isLoading"
        @submit="handleSubmit"
        @cancel="handleCancel"
      />
    </div>
  </div>
</template>
