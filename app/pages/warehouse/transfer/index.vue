<script setup lang="ts">
import { storeToRefs } from "pinia";
import TransferStockModal from "../_components/modals/TransferStockModal.vue";
import StockMovementTable from "../_components/table/StockMovementTable.vue";
import { useModal } from "~/composables/admin/useModal";
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

const { products } = storeToRefs(productStore);
const { logs, inventoryMeta } = storeToRefs(inventoryStore);
const { openModal } = useModal();

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

const assignedLogs = computed(() =>
  logs.value.filter((log) =>
    assignedWarehouses.includes(warehouseForProduct(log.product_id)),
  ),
);

const transferLogs = computed(() =>
  assignedLogs.value.filter((log) => log.reference_type === "transfer"),
);

const openTransfer = () => {
  openModal(TransferStockModal);
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
              Inventory Transfers
            </p>
            <h1 class="mt-2 text-2xl font-semibold">
              Move Stock Between Warehouses
            </h1>
            <p class="mt-2 text-sm text-slate-600">
              Transfer inventory from assigned warehouses to other locations.
            </p>
          </div>
          <div class="flex flex-wrap items-center gap-2">
            <UButton color="primary" @click="openTransfer">
              New Transfer
            </UButton>
          </div>
        </div>
      </section>

      <StockMovementTable :logs="transferLogs" :products="products" />
    </div>
  </div>
</template>
