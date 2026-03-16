<script setup lang="ts">
import { storeToRefs } from "pinia";
import LowStockTable from "./_components/table/LowStockTable.vue";
import PendingDeliveriesTable from "./_components/table/PendingDeliveriesTable.vue";
import {
  defaultAssignedWarehouses,
  getWarehouseForId,
} from "~/utils/warehouse";

definePageMeta({
  layout: "warehouse",
});

const inventoryStore = useInventoryStore();
const productStore = useProductStore();
const deliveryStore = useDeliveryStore();
const driverStore = useDriverStore();

await Promise.all([
  productStore.fetchProducts(),
  deliveryStore.fetchDeliveries(),
  driverStore.fetchDrivers(),
]);

const { products, productMeta } = storeToRefs(productStore);
const { inventoryMeta } = storeToRefs(inventoryStore);
const { deliveries, deliveryMeta } = storeToRefs(deliveryStore);
const { drivers } = storeToRefs(driverStore);

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

const ensureDeliveryWarehouses = (items: typeof deliveries.value) => {
  for (const delivery of items) {
    if (!deliveryMeta.value[delivery.id]?.warehouse_staff) {
      deliveryStore.updateDeliveryMeta(delivery.id, {
        warehouse_staff: getWarehouseForId(delivery.id),
      });
    }
  }
};

watch(products, (value) => ensureProductWarehouses(value), {
  immediate: true,
});

watch(deliveries, (value) => ensureDeliveryWarehouses(value), {
  immediate: true,
});

const warehouseForProduct = (productId: string) =>
  inventoryMeta.value[productId]?.warehouse ?? getWarehouseForId(productId);

const warehouseForDelivery = (deliveryId: string) =>
  deliveryMeta.value[deliveryId]?.warehouse_staff ?? getWarehouseForId(deliveryId);

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

const visibleDeliveries = computed(() =>
  deliveries.value.filter((delivery) =>
    assignedWarehouses.includes(warehouseForDelivery(delivery.id)),
  ),
);

const pendingDeliveries = computed(() =>
  visibleDeliveries.value.filter(
    (delivery) => delivery.status !== "delivered" && delivery.status !== "failed",
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
              Warehouse Dashboard
            </p>
            <h1 class="mt-2 text-2xl font-semibold">Inventory Overview</h1>
            <p class="mt-2 text-sm text-slate-600">
              Track low stock alerts and pending outbound deliveries.
            </p>
          </div>
          <div class="rounded-full border border-slate-200/70 px-4 py-2 text-sm">
            Assigned: {{ assignedWarehouses.join(", ") }}
          </div>
        </div>
      </section>

      <div class="grid gap-4 md:grid-cols-3">
        <UCard>
          <p class="text-xs uppercase tracking-[0.18em] text-slate-500">
            Low Stock Items
          </p>
          <p class="mt-2 text-2xl font-semibold">
            {{ lowStockItems.length }}
          </p>
        </UCard>
        <UCard>
          <p class="text-xs uppercase tracking-[0.18em] text-slate-500">
            Pending Deliveries
          </p>
          <p class="mt-2 text-2xl font-semibold">
            {{ pendingDeliveries.length }}
          </p>
        </UCard>
        <UCard>
          <p class="text-xs uppercase tracking-[0.18em] text-slate-500">
            Inventory Items
          </p>
          <p class="mt-2 text-2xl font-semibold">
            {{ visibleProducts.length }}
          </p>
        </UCard>
      </div>

      <LowStockTable
        :products="lowStockItems"
        :warehouse-for="warehouseForProduct"
        :status-for="statusForProduct"
      />

      <PendingDeliveriesTable
        :deliveries="pendingDeliveries"
        :drivers="drivers"
      />
    </div>
  </div>
</template>
