<script setup lang="ts">
import { storeToRefs } from "pinia";
import AdminPageStateCard from "../../_components/AdminPageStateCard.vue";
import ProductDescriptionCard from "../_components/detail/ProductDescriptionCard.vue";
import ProductDetailHeader from "../_components/detail/ProductDetailHeader.vue";
import ProductHandbookCard from "../_components/detail/ProductHandbookCard.vue";
import ProductInfoCard from "../_components/detail/ProductInfoCard.vue";
import ProductMediaStatsCard from "../_components/detail/ProductMediaStatsCard.vue";
import ProductSpecificationsCard from "../_components/detail/ProductSpecificationsCard.vue";
import { useAdminPageLoadState } from "~/composables/admin/useAdminPageLoadState";

definePageMeta({
  layout: "admin",
});

const route = useRoute();
const router = useRouter();
const productId = computed(() => String(route.params.id));

const productStore = useProductStore();
const { getLoadErrorMessage, isMissingResourceResponse } =
  useAdminPageLoadState();
const pageError = ref<string | null>(null);
const isMissingProduct = ref(false);
const isRetrying = ref(false);

const loadPage = async () => {
  const productResponse = await productStore.fetchProductById(productId.value);

  isMissingProduct.value = isMissingResourceResponse(productResponse);
  pageError.value =
    productResponse.status === "error" && !isMissingProduct.value
      ? getLoadErrorMessage(
          [productResponse],
          "The product record could not be loaded right now.",
        )
      : null;
};

await loadPage();

const { product } = storeToRefs(productStore);

const goBack = () => {
  void router.push("/admin/products");
};

const editProduct = () => {
  void router.push(`/admin/products/edit/${productId.value}`);
};

const retryLoad = async () => {
  isRetrying.value = true;
  await loadPage();
  isRetrying.value = false;
};
</script>

<template>
  <div class="min-h-screen">
    <div class="space-y-6">
      <ProductDetailHeader
        :product="product"
        @back="goBack"
        @edit="editProduct"
      />

      <AdminPageStateCard
        v-if="pageError"
        eyebrow="Product Details"
        title="Product unavailable"
        :description="pageError"
        tone="error"
        action-label="Retry"
        :action-loading="isRetrying"
        @action="retryLoad"
      />

      <AdminPageStateCard
        v-else-if="isMissingProduct || !product"
        eyebrow="Product Details"
        title="Product not found"
        description="The requested product record could not be loaded."
        action-label="Back to Products"
        action-color="neutral"
        action-icon="i-lucide-arrow-left"
        @action="goBack"
      />

      <div v-else-if="product" class="space-y-6">
        <div
          class="grid gap-6 xl:grid-cols-[minmax(0,1.2fr)_minmax(320px,0.9fr)]"
        >
          <ProductMediaStatsCard :product="product" />
          <ProductInfoCard :product="product" />
        </div>

        <div
          class="grid gap-6 xl:grid-cols-[minmax(0,1.1fr)_minmax(320px,0.9fr)]"
        >
          <ProductDescriptionCard :product="product" />
          <ProductHandbookCard :product="product" />
        </div>

        <ProductSpecificationsCard :product="product" />
      </div>
    </div>
  </div>
</template>
