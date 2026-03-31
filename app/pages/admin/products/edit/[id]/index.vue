<script setup lang="ts">
import { storeToRefs } from "pinia";
import AdminPageHeader from "../../../_components/AdminPageHeader.vue";
import AdminPageStateCard from "../../../_components/AdminPageStateCard.vue";
import ProductForm from "../../add/_components/ProductForm.vue";
import { useAdminPageLoadState } from "~/composables/admin/useAdminPageLoadState";
import type { Warehouse } from "~/types/warehouse";
import { useAdminResponseToast } from "~/composables/admin/useAdminResponseToast";

definePageMeta({
  layout: "admin",
});

const route = useRoute();
const productId = computed(() => String(route.params.id));

const productStore = useProductStore();
const categoryStore = useCategoryStore();
const { notifyResponse } = useAdminResponseToast();
const { getLoadErrorMessage, isMissingResourceResponse } =
  useAdminPageLoadState();
const pageError = ref<string | null>(null);
const isMissingProduct = ref(false);
const isRetrying = ref(false);

const loadPage = async () => {
  const [productResponse, categoriesResponse] = await Promise.all([
    productStore.fetchProductById(productId.value),
    categoryStore.fetchCategories(),
  ]);

  isMissingProduct.value = isMissingResourceResponse(productResponse);
  pageError.value =
    (productResponse.status === "error" && !isMissingProduct.value) ||
    categoriesResponse.status === "error"
      ? getLoadErrorMessage(
          [productResponse, categoriesResponse],
          "The product could not be loaded for editing right now.",
        )
      : null;
};

await loadPage();

const { product } = storeToRefs(productStore);
const { categories } = storeToRefs(categoryStore);
const warehouses = ref<Warehouse[]>([]);

const handleCancel = async () => {
  await navigateTo("/admin/products");
};

const handleSubmit = async (formData: FormData) => {
  if (!product.value?.id) return;

  const response = await productStore.updateProduct(product.value.id, formData);

  if (
    !notifyResponse(response, {
      successTitle: "Product updated",
      successDescription: "The product details have been saved.",
      errorTitle: "Product not updated",
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
        title="Edit Product"
        description="Update catalog details, pricing, stock settings, and product imagery."
        action-label="Back to Products"
        action-icon="i-lucide-arrow-left"
        action-color="neutral"
        action-to="/admin/products"
      />

      <AdminPageStateCard
        v-if="pageError"
        eyebrow="Product Form"
        title="Product unavailable"
        :description="pageError"
        tone="error"
        action-label="Retry"
        :action-loading="isRetrying"
        @action="handleRetry"
      />

      <AdminPageStateCard
        v-else-if="isMissingProduct || !product"
        eyebrow="Product Form"
        title="Product not found"
        description="The requested product could not be loaded for editing."
        action-label="Back to Products"
        action-color="neutral"
        action-icon="i-lucide-arrow-left"
        @action="handleCancel"
      />

      <ProductForm
        v-else
        :product="product"
        :categories="categories"
        :warehouses="warehouses"
        submit-label="Update Product"
        :is-submitting="productStore.isLoading"
        @submit="handleSubmit"
        @cancel="handleCancel"
      />
    </div>
  </div>
</template>
