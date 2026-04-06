<script setup lang="ts">
import { storeToRefs } from "pinia";
import AdminPageStateCard from "../../_components/AdminPageStateCard.vue";
import { useAdminPageLoadState } from "~/composables/admin/useAdminPageLoadState";
import { formatCurrency, formatLongDate, formatNumber } from "~/utils/format";

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

const featureList = computed(() => product.value?.handbook?.features ?? []);
const applicationList = computed(
  () => product.value?.handbook?.applications ?? [],
);
const specificationList = computed(
  () => product.value?.handbook?.specifications ?? [],
);
const productInitial = computed(
  () => product.value?.name?.slice(0, 1).toUpperCase() ?? "P",
);

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
      <section class="bg-white p-2">
        <div
          class="flex flex-col gap-4 md:flex-row md:items-center md:justify-between"
        >
          <div>
            <p class="text-xs uppercase tracking-[0.18em] text-slate-500">
              Catalog Details
            </p>
            <h1 class="mt-2 text-2xl font-semibold">
              {{ product?.name ?? "Product not found" }}
            </h1>
            <p class="mt-2 text-sm text-slate-600">
              Review pricing, stock readiness, and handbook notes.
            </p>
          </div>
          <div class="flex flex-wrap items-center gap-2">
            <UButton color="neutral" variant="outline" @click="goBack">
              Back to Products
            </UButton>
            <UButton v-if="product?.id" color="primary" @click="editProduct">
              Edit Product
            </UButton>
          </div>
        </div>
      </section>

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

      <div v-else class="space-y-6">
        <div
          class="grid gap-6 xl:grid-cols-[minmax(0,1.2fr)_minmax(320px,0.9fr)]"
        >
          <UCard>
            <div
              class="flex h-72 items-center justify-center overflow-hidden rounded-sm border border-slate-200/70 bg-gradient-to-br from-slate-100 via-white to-amber-50"
            >
              <NuxtImg
                v-if="product.image_url"
                :src="product.image_url"
                :alt="product.name"
                class="h-full w-full object-cover"
              />
              <div v-else class="text-center">
                <p class="text-xs uppercase tracking-[0.18em] text-slate-500">
                  Product
                </p>
                <p class="mt-3 text-5xl font-semibold text-slate-800">
                  {{ productInitial }}
                </p>
              </div>
            </div>

            <div class="mt-6 grid gap-4 md:grid-cols-3">
              <div>
                <p class="text-xs uppercase tracking-[0.18em] text-slate-500">
                  Unit Price
                </p>
                <p class="mt-2 text-lg font-semibold text-slate-800">
                  {{ formatCurrency(product.price ?? 0) }}
                </p>
              </div>
              <div>
                <p class="text-xs uppercase tracking-[0.18em] text-slate-500">
                  Stock On Hand
                </p>
                <p class="mt-2 text-lg font-semibold text-slate-800">
                  {{ formatNumber(product.stock_quantity ?? 0) }}
                </p>
              </div>
              <div>
                <p class="text-xs uppercase tracking-[0.18em] text-slate-500">
                  Minimum Stock
                </p>
                <p class="mt-2 text-lg font-semibold text-slate-800">
                  {{ formatNumber(product.minimum_stock_quantity ?? 0) }}
                </p>
              </div>
            </div>
          </UCard>

          <UCard>
            <div class="flex items-center justify-between gap-3">
              <div>
                <p class="text-xs uppercase tracking-[0.18em] text-slate-500">
                  SKU
                </p>
                <p class="mt-2 text-xl font-semibold text-slate-900">
                  {{ product.sku ?? "No SKU" }}
                </p>
              </div>
              <UBadge
                :color="product.is_active ? 'success' : 'neutral'"
                variant="subtle"
              >
                {{ product.is_active ? "Active" : "Inactive" }}
              </UBadge>
            </div>

            <div class="mt-6 space-y-4">
              <div class="flex items-start justify-between gap-4">
                <span class="text-sm text-slate-500">Category</span>
                <span class="text-right font-medium text-slate-800">
                  {{ product.category?.name ?? "Unassigned" }}
                </span>
              </div>
              <div class="flex items-start justify-between gap-4">
                <span class="text-sm text-slate-500">Warehouse</span>
                <span class="text-right font-medium text-slate-800">
                  {{ product.warehouse?.name ?? "Unassigned" }}
                </span>
              </div>
              <div class="flex items-start justify-between gap-4">
                <span class="text-sm text-slate-500">Unit</span>
                <span class="text-right font-medium text-slate-800">
                  {{ product.unit ?? "N/A" }}
                </span>
              </div>
              <div class="flex items-start justify-between gap-4">
                <span class="text-sm text-slate-500">Created</span>
                <span class="text-right font-medium text-slate-800">
                  {{
                    product.created_at
                      ? formatLongDate(product.created_at)
                      : "Unknown"
                  }}
                </span>
              </div>
              <div class="flex items-start justify-between gap-4">
                <span class="text-sm text-slate-500">Updated</span>
                <span class="text-right font-medium text-slate-800">
                  {{
                    product.updated_at
                      ? formatLongDate(product.updated_at)
                      : "Unknown"
                  }}
                </span>
              </div>
            </div>
          </UCard>
        </div>

        <div
          class="grid gap-6 xl:grid-cols-[minmax(0,1.1fr)_minmax(320px,0.9fr)]"
        >
          <UCard>
            <div class="space-y-4">
              <div>
                <p class="text-xs uppercase tracking-[0.18em] text-slate-500">
                  Description
                </p>
                <p class="mt-2 text-sm leading-7 text-slate-700">
                  {{
                    product.description?.trim() ||
                    "No product description has been added yet."
                  }}
                </p>
              </div>

              <div>
                <p class="text-xs uppercase tracking-[0.18em] text-slate-500">
                  Handbook Summary
                </p>
                <p class="mt-2 text-sm leading-7 text-slate-700">
                  {{
                    product.handbook?.summary?.trim() ||
                    "No handbook summary has been provided yet."
                  }}
                </p>
              </div>
            </div>
          </UCard>

          <UCard>
            <div class="space-y-5">
              <div>
                <p class="text-xs uppercase tracking-[0.18em] text-slate-500">
                  Key Features
                </p>
                <div
                  v-if="featureList.length"
                  class="mt-3 flex flex-wrap gap-2"
                >
                  <UBadge
                    v-for="feature in featureList"
                    :key="feature"
                    color="info"
                    variant="subtle"
                  >
                    {{ feature }}
                  </UBadge>
                </div>
                <p v-else class="mt-2 text-sm text-slate-600">
                  No key features listed.
                </p>
              </div>

              <div>
                <p class="text-xs uppercase tracking-[0.18em] text-slate-500">
                  Applications
                </p>
                <ul
                  v-if="applicationList.length"
                  class="mt-3 space-y-2 text-sm text-slate-700"
                >
                  <li
                    v-for="application in applicationList"
                    :key="application"
                    class="rounded-xl border border-slate-200/70 px-3 py-2"
                  >
                    {{ application }}
                  </li>
                </ul>
                <p v-else class="mt-2 text-sm text-slate-600">
                  No applications listed.
                </p>
              </div>
            </div>
          </UCard>
        </div>

        <UCard>
          <div>
            <p class="text-xs uppercase tracking-[0.18em] text-slate-500">
              Specifications
            </p>
            <div
              v-if="specificationList.length"
              class="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-3"
            >
              <div
                v-for="specification in specificationList"
                :key="`${specification.label}-${specification.value}`"
                class="rounded-2xl border border-slate-200/70 p-4"
              >
                <p class="text-xs uppercase tracking-[0.18em] text-slate-500">
                  {{ specification.label }}
                </p>
                <p class="mt-2 text-sm font-medium text-slate-800">
                  {{ specification.value }}
                </p>
              </div>
            </div>
            <p v-else class="mt-3 text-sm text-slate-600">
              No specifications have been added for this product.
            </p>
          </div>
        </UCard>
      </div>
    </div>
  </div>
</template>
