<script setup lang="ts">
import { storeToRefs } from "pinia";
import StorefrontPageContainer from "~/components/storefront/StorefrontPageContainer.vue";
import StorefrontPageHeader from "~/components/storefront/StorefrontPageHeader.vue";
import StorefrontSkeletonList from "~/components/storefront/StorefrontSkeletonList.vue";
import StorefrontStateCard from "~/components/storefront/StorefrontStateCard.vue";
import { formatCurrency } from "~/utils/format";
import CartEmptyState from "./_components/CartEmptyState.vue";
import CartItemsList from "./_components/CartItemsList.vue";
import CartSummaryCard from "./_components/CartSummaryCard.vue";

definePageMeta({
  layout: "shop",
});

useSeoMeta({
  title: "Cart | ZOOM WIDE Construction Supplies",
  description:
    "Review cart items, adjust quantities, and prepare your ZOOM WIDE construction supply order for checkout.",
});

const cartStore = useCartStore();
const authStore = useAuthStore();
const productStore = useProductStore();

const pageError = ref<string | null>(null);
const isRetrying = ref(false);

const { items, subtotal, itemCount, distinctItemCount, isLoading, isSyncing } =
  storeToRefs(cartStore);
const { isAuthenticated } = storeToRefs(authStore);
const { products } = storeToRefs(productStore);

const loadPage = async () => {
  const [cartResponse, productsResponse] = await Promise.all([
    cartStore.fetchCart(),
    productStore.fetchProducts({ page: 1 }),
  ]);

  pageError.value =
    cartResponse.status === "success" && productsResponse.status === "success"
      ? null
      : cartResponse.message ||
        productsResponse.message ||
        "The cart could not be loaded right now.";
};

await loadPage();

const recommendedProducts = computed(() => {
  const cartIds = new Set(items.value.map((item) => item.product_id));

  return products.value
    .filter(
      (product) =>
        product.id &&
        !cartIds.has(product.id) &&
        product.is_active !== false &&
        (product.stock_quantity ?? 0) > 0,
    )
    .slice(0, 4);
});

const freightAmount = computed(() =>
  subtotal.value > 0 ? Math.max(145, subtotal.value * 0.08) : 0,
);

const taxAmount = computed(() => subtotal.value * 0.08);

const totalAmount = computed(
  () => subtotal.value + freightAmount.value + taxAmount.value,
);

const notes = computed(() => {
  if (!isAuthenticated.value) {
    return "Sign in during checkout to sync this guest cart with your customer record.";
  }

  if (!items.value.length) {
    return "Add products to your cart to prepare your order summary.";
  }

  return "Freight and tax are shown as planning estimates until final checkout details are confirmed.";
});

const handleRetry = async () => {
  isRetrying.value = true;
  await loadPage();
  isRetrying.value = false;
};

const handleAddRecommended = async (productId?: string) => {
  if (!productId) {
    return;
  }

  const product = recommendedProducts.value.find((item) => item.id === productId);

  if (!product) {
    return;
  }

  await cartStore.addToCart(product, 1);
};
</script>

<template>
  <StorefrontPageContainer size="wide" class="py-8 md:py-10">
    <StorefrontPageHeader
      eyebrow="Cart"
      title="Your project load"
      :description="`${itemCount} items in cart with ${formatCurrency(subtotal)} in live merchandise subtotal.`"
    >
      <template #actions>
        <div class="rounded-xl border border-slate-200/80 bg-white px-4 py-3 text-left shadow-sm">
          <p class="text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-slate-500">
            Cart status
          </p>
          <p class="mt-1 text-sm font-semibold text-slate-900">
            {{ distinctItemCount }} line items ready for review
          </p>
        </div>
      </template>
    </StorefrontPageHeader>

    <StorefrontStateCard
      v-if="pageError"
      class="mt-6"
      eyebrow="Cart"
      title="Cart unavailable"
      :description="pageError"
      tone="error"
    >
      <template #actions>
        <StorefrontButton
          tone="danger"
          :loading="isRetrying"
          @click="handleRetry"
        >
          Retry
        </StorefrontButton>
      </template>
    </StorefrontStateCard>

    <div
      v-else
      class="mt-6 grid gap-8 lg:grid-cols-[minmax(0,1fr)_380px] xl:grid-cols-[minmax(0,1fr)_400px]"
    >
      <div class="space-y-6">
        <StorefrontSkeletonList
          v-if="isLoading"
          :count="3"
          item-class="h-[160px]"
        />

        <CartEmptyState v-else-if="!items.length" />

        <CartItemsList
          v-else
          :items="items"
          :is-busy="isSyncing"
        />
      </div>

      <CartSummaryCard
        :subtotal="subtotal"
        :freight-amount="freightAmount"
        :tax-amount="taxAmount"
        :total-amount="totalAmount"
        :item-count="itemCount"
        :notes="notes"
        :is-busy="isSyncing"
        :has-items="items.length > 0"
        :is-authenticated="isAuthenticated"
      />
    </div>

    <section
      v-if="!pageError && recommendedProducts.length"
      class="mt-16 border-t border-slate-200/80 pt-12"
    >
      <div class="mb-8 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <p class="text-[0.72rem] font-semibold uppercase tracking-[0.22em] text-amber-700">
            Structural complements
          </p>
          <h2 class="mt-3 text-3xl font-bold tracking-[-0.04em] text-slate-950">
            Add a few related products before checkout.
          </h2>
        </div>
        <StorefrontButton tone="secondary" to="/shop/catalog">
          Browse full catalog
        </StorefrontButton>
      </div>

      <div class="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
        <ShopHomeProductCard
          v-for="product in recommendedProducts"
          :key="product.id || product.sku || product.name"
          :product="product"
          :category-name="product.category?.name"
          :disabled="isSyncing"
          @add="handleAddRecommended"
        />
      </div>
    </section>
  </StorefrontPageContainer>
</template>
