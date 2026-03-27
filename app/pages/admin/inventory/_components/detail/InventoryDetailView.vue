<script setup lang="ts">
import { storeToRefs } from "pinia";
import AdminPageStateCard from "../../../_components/AdminPageStateCard.vue";
import { useAdminPageLoadState } from "~/composables/admin/useAdminPageLoadState";
import { buildInventoryBalanceMap } from "~/utils/inventory-balance";
import { getWarehouseNameById } from "~/utils/warehouse";
import type { CreateInventoryMovementPayload } from "~/types/inventory";
import InventoryAdjustmentsCard from "./InventoryAdjustmentsCard.vue";
import InventoryLowStockCard from "./InventoryLowStockCard.vue";
import InventoryMovementsCard from "./InventoryMovementsCard.vue";
import InventoryOverviewCard from "./InventoryOverviewCard.vue";

const props = defineProps<{
  backTo: string;
  productBasePath?: string;
}>();

const route = useRoute();
const router = useRouter();
const productId = computed(() => String(route.params.id));

const productStore = useProductStore();
const inventoryStore = useInventoryStore();
const warehouseStore = useWarehouseStore();
const toast = useToast();
const { getLoadErrorMessage, isMissingResourceResponse } =
  useAdminPageLoadState();
const pageError = ref<string | null>(null);
const isMissingProduct = ref(false);
const isRetrying = ref(false);
const isSavingAdjustment = ref(false);
const adjustmentSaveVersion = ref(0);

const loadPage = async () => {
  const [productResponse, inventoryResponse, warehouseResponse] =
    await Promise.all([
      productStore.fetchProductById(productId.value),
      inventoryStore.fetchInventoryLogs({
        q: "",
        page: 1,
      }),
      warehouseStore.fetchWarehouses({
        q: "",
        status: "",
        page: 1,
      }),
    ]);

  isMissingProduct.value = isMissingResourceResponse(productResponse);
  pageError.value =
    productResponse.status === "error" && !isMissingProduct.value
      ? getLoadErrorMessage(
          [productResponse],
          "The inventory record could not be loaded right now.",
        )
      : null;

  if (inventoryResponse.status === "error") {
    console.warn("Inventory movement history is unavailable for this product.");
  }

  if (warehouseResponse.status === "error") {
    console.warn("Warehouse summary is unavailable for this product.");
  }
};

await loadPage();

watch(
  () => productId.value,
  async () => {
    await loadPage();
  },
);

const { product, isLoading: isProductLoading } = storeToRefs(productStore);
const { logs, isLoading: isInventoryLoading } = storeToRefs(inventoryStore);
const { warehouses } = storeToRefs(warehouseStore);

const currentStock = computed(() => {
  if (!product.value?.id) {
    return 0;
  }

  const balances = buildInventoryBalanceMap(logs.value, [product.value]);
  return balances[product.value.id] ?? 0;
});

const warehouseName = computed(
  () => getWarehouseNameById(product.value?.warehouse_id, warehouses.value) ?? "Unassigned",
);

const movementLogs = computed(() =>
  product.value?.id
    ? logs.value.filter((entry) => entry.product_id === product.value?.id)
    : [],
);

const goBack = () => {
  void router.push(props.backTo);
};

const retryLoad = async () => {
  isRetrying.value = true;
  await loadPage();
  isRetrying.value = false;
};

const handleSaveAdjustment = async (payload: CreateInventoryMovementPayload) => {
  if (isSavingAdjustment.value) {
    return;
  }

  isSavingAdjustment.value = true;

  const response = await inventoryStore.createInventoryMovement(payload);

  if (response.status === "error") {
    toast.add({
      title: "Stock adjustment failed",
      description: response.message || "Please try again.",
      color: "error",
      icon: "i-lucide-circle-alert",
    });
    isSavingAdjustment.value = false;
    return;
  }

  toast.add({
    title: "Stock adjustment saved",
    description:
      response.message || "The inventory movement was recorded successfully.",
    color: "success",
    icon: "i-lucide-circle-check",
  });

  adjustmentSaveVersion.value += 1;
  await loadPage();
  isSavingAdjustment.value = false;
};

const isPageLoading = computed(
  () => isProductLoading.value || isInventoryLoading.value,
);
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
              Inventory Details
            </p>
            <h1 class="mt-2 text-2xl font-semibold">
              {{ product?.name ? `${product.name}` : "Inventory not found" }}
            </h1>
            <p class="mt-2 text-sm text-slate-600">
              Review current stock, warehouse context, and recent inventory activity.
            </p>
          </div>

          <UButton color="neutral" variant="outline" @click="goBack">
            Back to Inventory
          </UButton>
        </div>
      </section>

      <AdminPageStateCard
        v-if="pageError"
        eyebrow="Inventory Details"
        title="Inventory unavailable"
        :description="pageError"
        tone="error"
        action-label="Retry"
        :action-loading="isRetrying"
        @action="retryLoad"
      />

      <AdminPageStateCard
        v-else-if="isMissingProduct || !product"
        eyebrow="Inventory Details"
        title="Inventory record not found"
        description="Check the URL or return to the inventory list."
        action-label="Back to Inventory"
        action-color="neutral"
        action-icon="i-lucide-arrow-left"
        @action="goBack"
      />

      <div v-else class="space-y-6">
        <div class="grid gap-6 xl:grid-cols-[minmax(0,1.2fr)_minmax(320px,0.9fr)]">
          <InventoryOverviewCard
            :product="product"
            :current-stock="currentStock"
            :warehouse-name="warehouseName"
            :product-base-path="props.productBasePath"
          />
          <InventoryLowStockCard
            :product="product"
            :current-stock="currentStock"
          />
        </div>

        <div class="grid gap-6 xl:grid-cols-[minmax(0,1.2fr)_minmax(320px,0.9fr)]">
          <InventoryMovementsCard
            :product="product"
            :movements="movementLogs"
            :warehouse-name="warehouseName"
            :is-loading="isPageLoading"
          />
          <InventoryAdjustmentsCard
            :product="product"
            :current-stock="currentStock"
            :is-saving="isSavingAdjustment"
            :save-version="adjustmentSaveVersion"
            @submit="handleSaveAdjustment"
          />
        </div>
      </div>
    </div>
  </div>
</template>
