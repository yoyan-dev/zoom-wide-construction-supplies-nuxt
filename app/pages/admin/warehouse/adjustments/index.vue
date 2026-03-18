<script setup lang="ts">
import { storeToRefs } from "pinia";
import type { UserRole } from "~/types/user";
import AdminAdjustmentsTable from "../_components/table/AdminAdjustmentsTable.vue";
import {
  getWarehouseForId,
  getWarehouseNameById,
  warehouseOptions as defaultWarehouses,
} from "~/utils/warehouse";

definePageMeta({
  layout: "admin",
});

const inventoryStore = useInventoryStore();
const productStore = useProductStore();
const warehouseStore = useWarehouseStore();

await Promise.all([
  inventoryStore.fetchInventoryLogs(),
  productStore.fetchProducts(),
  warehouseStore.fetchWarehouses(),
]);

const { logs, query, inventoryMeta } = storeToRefs(inventoryStore);
const { products } = storeToRefs(productStore);
const { warehouses } = storeToRefs(warehouseStore);

const role = useState<UserRole>("current-role", () => "admin");
const hasAccess = computed(() => role.value === "admin");

const warehouseFilter = ref("all");
const typeFilter = ref("all");
const sortBy = ref("date-desc");

const search = computed(() => query.value.q ?? "");

const handleSearch = async (value: string) => {
  await inventoryStore.setSearch(value);
};

const warehouseNames = computed(() =>
  warehouses.value.map((warehouse) => warehouse.name),
);

const warehouseNameList = computed(() =>
  warehouseNames.value.length ? warehouseNames.value : defaultWarehouses,
);

const warehouseForProduct = (productId: string) => {
  const product = products.value.find((item) => item.id === productId);
  return (
    inventoryMeta.value[productId]?.warehouse ??
    getWarehouseNameById(product?.warehouse_id, warehouses.value) ??
    getWarehouseForId(productId, warehouseNameList.value)
  );
};

const isAdjustmentLog = (log: typeof logs.value[number]) =>
  log.reference_type === "adjustment" ||
  log.reference_type === "cycle_count" ||
  log.movement_type === "adjustment";

const adjustmentType = (log: typeof logs.value[number]) => {
  if (log.movement_type === "adjustment") return "adjustment";
  if (log.movement_type === "in") return "increase";
  if (log.movement_type === "out") return "decrease";
  return "adjustment";
};

const warehouseOptions = computed(() => [
  { label: "All warehouses", value: "all" },
  ...warehouseNameList.value.map((name) => ({ label: name, value: name })),
]);

const typeOptions = [
  { label: "All types", value: "all" },
  { label: "Increase", value: "increase" },
  { label: "Decrease", value: "decrease" },
  { label: "Adjustment", value: "adjustment" },
];

const sortOptions = [
  { label: "Date (Newest)", value: "date-desc" },
  { label: "Date (Oldest)", value: "date-asc" },
  { label: "Quantity (High-Low)", value: "quantity-desc" },
  { label: "Quantity (Low-High)", value: "quantity-asc" },
];

const filteredLogs = computed(() => {
  let items = logs.value.filter(isAdjustmentLog);

  if (warehouseFilter.value !== "all") {
    items = items.filter(
      (log) => warehouseForProduct(log.product_id) === warehouseFilter.value,
    );
  }

  if (typeFilter.value !== "all") {
    items = items.filter(
      (log) => adjustmentType(log) === typeFilter.value,
    );
  }

  switch (sortBy.value) {
    case "date-asc":
      return items.sort(
        (a, b) =>
          new Date(a.created_at).getTime() -
          new Date(b.created_at).getTime(),
      );
    case "quantity-desc":
      return items.sort(
        (a, b) => Math.abs(b.quantity_change) - Math.abs(a.quantity_change),
      );
    case "quantity-asc":
      return items.sort(
        (a, b) => Math.abs(a.quantity_change) - Math.abs(b.quantity_change),
      );
    default:
      return items.sort(
        (a, b) =>
          new Date(b.created_at).getTime() -
          new Date(a.created_at).getTime(),
      );
  }
});
</script>

<template>
  <div class="min-h-screen">
    <div class="space-y-6">
      <section class="bg-white p-2">
        <div class="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p class="text-xs uppercase tracking-[0.18em] text-slate-500">
              Stock Adjustments
            </p>
            <h1 class="mt-2 text-2xl font-semibold">Inventory Adjustments</h1>
            <p class="mt-2 text-sm text-slate-600">
              Track manual changes across all warehouse inventory records.
            </p>
          </div>
        </div>
      </section>

      <UCard v-if="!hasAccess">
        <p class="text-sm text-slate-600">
          You do not have permission to view stock adjustments.
        </p>
      </UCard>

      <div v-else class="space-y-4">
        <UCard>
          <div class="flex flex-wrap items-center gap-3">
            <UInput
              :model-value="search"
              class="w-64"
              icon="i-lucide-search"
              placeholder="Search adjustments"
              @update:model-value="handleSearch(String($event))"
            />
            <USelect
              class="w-56"
              valueKey="value"
              labelKey="label"
              v-model="warehouseFilter"
              :items="warehouseOptions"
            />
            <USelect
              class="w-48"
              valueKey="value"
              labelKey="label"
              v-model="typeFilter"
              :items="typeOptions"
            />
            <USelect
              class="w-56"
              valueKey="value"
              labelKey="label"
              v-model="sortBy"
              :items="sortOptions"
            />
          </div>
        </UCard>

        <AdminAdjustmentsTable
          :logs="filteredLogs"
          :products="products"
          :warehouse-for="warehouseForProduct"
        />
      </div>
    </div>
  </div>
</template>
