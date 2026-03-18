<script setup lang="ts">
import { storeToRefs } from "pinia";
import WarehouseInventoryTable from "../_components/table/WarehouseInventoryTable.vue";
import {
  defaultAssignedWarehouses,
  getWarehouseForId,
} from "~/utils/warehouse";

definePageMeta({
  layout: "warehouse",
});

const inventoryStore = useInventoryStore();
const productStore = useProductStore();

await productStore.fetchProducts();

const { products, productMeta } = storeToRefs(productStore);
const { inventoryMeta } = storeToRefs(inventoryStore);

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
              Inventory Management
            </p>
            <h1 class="mt-2 text-2xl font-semibold">Warehouse Inventory</h1>
            <p class="mt-2 text-sm text-slate-600">
              Monitor stock levels and take quick actions on inventory records.
            </p>
          </div>
          <div class="rounded-full border border-slate-200/70 px-4 py-2 text-sm">
            Assigned: {{ assignedWarehouses.join(", ") }}
          </div>
        </div>
      </section>

      <WarehouseInventoryTable
        :products="visibleProducts"
        :warehouse-for="warehouseForProduct"
        :status-for="statusForProduct"
      />
    </div>
  </div>
</template>
