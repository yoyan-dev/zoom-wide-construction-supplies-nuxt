<script setup lang="ts">
import { storeToRefs } from "pinia";
import ShopStateCard from "../../_components/ShopStateCard.vue";
import ShopProductDescriptionCard from "./ShopProductDescriptionCard.vue";
import ShopProductHeroCard from "./ShopProductHeroCard.vue";
import ShopProductLoadingState from "./ShopProductLoadingState.vue";
import ShopProductPurchaseCard from "./ShopProductPurchaseCard.vue";
import { useAdminPageLoadState } from "~/composables/admin/useAdminPageLoadState";

const props = defineProps<{
  productId: string;
}>();

const productStore = useProductStore();
const { getLoadErrorMessage, isMissingResourceResponse } =
  useAdminPageLoadState();
const router = useRouter();
const pageError = ref<string | null>(null);
const isMissingProduct = ref(false);
const isRetrying = ref(false);

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

const { product, isLoading } = storeToRefs(productStore);

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
  <div class="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-6 sm:px-6 lg:px-8">
    <section class="rounded-[32px] border border-slate-200/70 bg-white p-6 shadow-sm md:p-8">
      <div class="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <p class="text-xs uppercase tracking-[0.22em] text-amber-600">
            Product Details
          </p>
          <h1 class="mt-3 text-3xl font-semibold tracking-tight text-slate-900">
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
    </div>
  </div>
</template>
