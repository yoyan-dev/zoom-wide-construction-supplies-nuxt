<script setup lang="ts">
import { storeToRefs } from "pinia";
import LowStockTable from "../_components/table/LowStockTable.vue";
import StockMovementTable from "../_components/table/StockMovementTable.vue";
import {
  defaultAssignedWarehouses,
  getWarehouseForId,
} from "~/utils/warehouse";

definePageMeta({
  layout: "warehouse",
});

const inventoryStore = useInventoryStore();
const productStore = useProductStore();

await Promise.all([
  productStore.fetchProducts(),
  inventoryStore.fetchInventoryLogs(),
]);

const { products, productMeta } = storeToRefs(productStore);
const { logs, inventoryMeta } = storeToRefs(inventoryStore);

const assignedWarehouses = defaultAssignedWarehouses;

const ensureProductWarehouses = (items: typeof products.value) => {
  for (const product of items) {
    if (!product.id) continue;
    if (!inventoryMeta.value[product.id]?.warehouse) {
      inventoryStore.updateInventoryWarehouse(
        product.id,
        getWarehouseForId(product.id),
      );
    }
  }
};

watch(products, (value) => ensureProductWarehouses(value), { immediate: true });

const warehouseForProduct = (productId: string) =>
  inventoryMeta.value[productId]?.warehouse ?? getWarehouseForId(productId);

const visibleProducts = computed(() =>
  products.value.filter((product) =>
    product.id
      ? assignedWarehouses.includes(warehouseForProduct(product.id))
      : false,
  ),
);

const lowStockItems = computed(() =>
  visibleProducts.value.filter(
    (product) =>
      (product.stock_quantity ?? 0) <= (product.minimum_stock_quantity ?? 0),
  ),
);

const assignedLogs = computed(() =>
  logs.value.filter((log) =>
    assignedWarehouses.includes(warehouseForProduct(log.product_id)),
  ),
);

const statusForProduct = (product: typeof products.value[number]) => {
  const metaStatus = product.id ? inventoryMeta.value[product.id]?.status : undefined;
  const archived = product.id ? productMeta.value[product.id]?.archived : false;
  if (archived || metaStatus === "archived") {
    return { label: "archived", tone: "neutral" } as const;
  }
  if (metaStatus === "unavailable" || product.is_active === false) {
    return { label: "unavailable", tone: "warning" } as const;
  }
  return { label: "available", tone: "success" } as const;
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
              Warehouse Reports
            </p>
            <h1 class="mt-2 text-2xl font-semibold">Inventory Analytics</h1>
            <p class="mt-2 text-sm text-slate-600">
              Track stock movement and alert thresholds for your warehouse.
            </p>
          </div>
          <div class="rounded-full border border-slate-200/70 px-4 py-2 text-sm">
            Assigned: {{ assignedWarehouses.join(", ") }}
          </div>
        </div>
      </section>

      <StockMovementTable :logs="assignedLogs" :products="products" />

      <LowStockTable
        :products="lowStockItems"
        :warehouse-for="warehouseForProduct"
        :status-for="statusForProduct"
      />
    </div>
  </div>
</template>
