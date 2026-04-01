<script setup lang="ts">
import { storeToRefs } from "pinia";
import type { Product } from "~/types/product";
import ShopStateCard from "../../_components/ShopStateCard.vue";
import ShopProductDescriptionCard from "./ShopProductDescriptionCard.vue";
import ShopProductHeroCard from "./ShopProductHeroCard.vue";
import ShopProductLoadingState from "./ShopProductLoadingState.vue";
import ShopProductPurchaseCard from "./ShopProductPurchaseCard.vue";
import ShopRelatedProductsSection from "./ShopRelatedProductsSection.vue";
import { useAdminPageLoadState } from "~/composables/admin/useAdminPageLoadState";
import { apiRequest } from "~/utils/api";

const props = defineProps<{
  productId: string;
}>();

const productStore = useProductStore();
const { product, isLoading } = storeToRefs(productStore);
const { getLoadErrorMessage, isMissingResourceResponse } =
  useAdminPageLoadState();
const router = useRouter();
const pageError = ref<string | null>(null);
const isMissingProduct = ref(false);
const isRetrying = ref(false);
const relatedProducts = ref<Product[]>([]);
const isRelatedLoading = ref(false);

const loadRelatedProducts = async () => {
  if (!product.value?.category_id || !product.value.id) {
    relatedProducts.value = [];
    return;
  }

  isRelatedLoading.value = true;

  try {
    const response = await apiRequest<Product[]>("/products", {
      query: {
        category_id: product.value.category_id,
        page: 1,
      },
    });

    const candidates = response.data ?? [];

    relatedProducts.value = candidates
      .filter(
        (candidate) =>
          candidate.id &&
          candidate.id !== product.value?.id &&
          candidate.is_active !== false,
      )
      .slice(0, 3);
  } catch {
    relatedProducts.value = [];
  } finally {
    isRelatedLoading.value = false;
  }
};

const loadPage = async () => {
  const productResponse = await productStore.fetchProductById(props.productId);

  isMissingProduct.value = isMissingResourceResponse(productResponse);
  pageError.value =
    productResponse.status === "error" && !isMissingProduct.value
      ? getLoadErrorMessage(
          [productResponse],
          "The product record could not be loaded right now.",
        )
      : null;

  if (productResponse.status === "success" && product.value) {
    await loadRelatedProducts();
  } else {
    relatedProducts.value = [];
  }
};

await loadPage();

watch(
  () => props.productId,
  async (nextId, previousId) => {
    if (nextId === previousId) {
      return;
    }

    await loadPage();
  },
);

const goBack = () => {
  void router.push("/shop");
};

const retryLoad = async () => {
  isRetrying.value = true;
  await loadPage();
  isRetrying.value = false;
};
</script>

<template>
  <div class="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-5 sm:px-6 sm:py-6 lg:px-8">
    <section class="rounded-xl bg-white/95 shadow-sm p-6 md:p-8">
      <div class="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <p class="text-xs font-medium uppercase tracking-[0.2em] text-amber-700">
            Product Details
          </p>
          <h1 class="mt-3 text-3xl font-semibold tracking-tight text-slate-900 md:text-4xl">
            {{ product?.name ?? "Product not found" }}
          </h1>
          <p class="mt-3 text-sm leading-7 text-slate-600">
            Review pricing, stock visibility, category context, and the product
            information needed before adding materials to your cart.
          </p>
        </div>

        <div class="flex items-center gap-3">
          <UButton color="neutral" variant="outline" @click="goBack">
            Back to Shop
          </UButton>
        </div>
      </div>
    </section>

    <ShopStateCard
      v-if="pageError"
      eyebrow="Product Details"
      title="Product unavailable"
      :description="pageError"
      tone="error"
      action-label="Retry"
      :action-loading="isRetrying"
      @action="retryLoad"
    />

    <ShopStateCard
      v-else-if="isMissingProduct || !product"
      eyebrow="Product Details"
      title="Product not found"
      description="The product you requested could not be found. Return to the storefront and continue browsing available materials."
      action-label="Back to Shop"
      @action="goBack"
    />

    <ShopProductLoadingState v-else-if="isLoading" />

    <div v-else class="space-y-6">
      <div class="grid gap-6 xl:grid-cols-[minmax(0,1.2fr)_minmax(320px,0.9fr)]">
        <ShopProductHeroCard :product="product" />
        <ShopProductPurchaseCard :product="product" />
      </div>

      <ShopProductDescriptionCard :product="product" />
      <ShopRelatedProductsSection
        :products="relatedProducts"
        :is-loading="isRelatedLoading"
      />
    </div>
  </div>
</template>
