<script setup lang="ts">
import { storeToRefs } from "pinia";
import type { UserRole } from "~/types/user";
import AdminInventoryTable from "../_components/table/AdminInventoryTable.vue";
import {
  getWarehouseForId,
  getWarehouseNameById,
  warehouseOptions as defaultWarehouses,
} from "~/utils/warehouse";

definePageMeta({
  layout: "admin",
});

const productStore = useProductStore();
const inventoryStore = useInventoryStore();
const warehouseStore = useWarehouseStore();

await Promise.all([
  productStore.fetchProducts(),
  inventoryStore.fetchInventoryLogs(),
  warehouseStore.fetchWarehouses(),
]);

const { products, productMeta, query } = storeToRefs(productStore);
const { inventoryMeta } = storeToRefs(inventoryStore);
const { warehouses } = storeToRefs(warehouseStore);

const role = useState<UserRole>("current-role", () => "admin");
const hasAccess = computed(() => role.value === "admin");

const route = useRoute();

const warehouseFilter = ref("all");
const statusFilter = ref("all");
const sortBy = ref("name-asc");

const search = computed(() => query.value.q ?? "");

const handleSearch = async (value: string) => {
  await productStore.setSearch(value);
};

const warehouseNames = computed(() =>
  warehouses.value.map((warehouse) => warehouse.name),
);

const warehouseNameList = computed(() =>
  warehouseNames.value.length ? warehouseNames.value : defaultWarehouses,
);

const warehouseById = computed(() => {
  const map: Record<string, string> = {};
  for (const warehouse of warehouses.value) {
    map[warehouse.id] = warehouse.name;
  }
  return map;
});

watch(
  () => [route.query.warehouse, warehouses.value],
  () => {
    const raw = route.query.warehouse;
    if (!raw) return;
    const key = Array.isArray(raw) ? raw[0] : String(raw);
    const mapped = warehouseById.value[key] ?? key;
    warehouseFilter.value = mapped;
  },
  { immediate: true },
);

const warehouseForProduct = (productId: string) => {
  const product = products.value.find((item) => item.id === productId);
  return (
    inventoryMeta.value[productId]?.warehouse ??
    getWarehouseNameById(product?.warehouse_id, warehouses.value) ??
    getWarehouseForId(productId, warehouseNameList.value)
  );
};

const statusForProduct = (product: typeof products.value[number]) => {
  const metaStatus = product.id
    ? inventoryMeta.value[product.id]?.status
    : undefined;
  const archived = product.id ? productMeta.value[product.id]?.archived : false;
  if (archived || metaStatus === "archived") {
    return { label: "archived", tone: "neutral" } as const;
  }
  if (metaStatus === "unavailable" || product.is_active === false) {
    return { label: "unavailable", tone: "warning" } as const;
  }
  return { label: "available", tone: "success" } as const;
};

const warehouseOptions = computed(() => [
  { label: "All warehouses", value: "all" },
  ...warehouseNameList.value.map((name) => ({ label: name, value: name })),
]);

const statusOptions = [
  { label: "All statuses", value: "all" },
  { label: "Available", value: "available" },
  { label: "Unavailable", value: "unavailable" },
  { label: "Archived", value: "archived" },
];

const sortOptions = [
  { label: "Name (A-Z)", value: "name-asc" },
  { label: "Name (Z-A)", value: "name-desc" },
  { label: "Stock (High-Low)", value: "stock-desc" },
  { label: "Stock (Low-High)", value: "stock-asc" },
  { label: "Minimum (High-Low)", value: "min-desc" },
  { label: "Minimum (Low-High)", value: "min-asc" },
];

const visibleProducts = computed(() => {
  let items = [...products.value];

  if (warehouseFilter.value !== "all") {
    items = items.filter((product) =>
      product.id
        ? warehouseForProduct(product.id) === warehouseFilter.value
        : false,
    );
  }

  if (statusFilter.value !== "all") {
    items = items.filter(
      (product) => statusForProduct(product).label === statusFilter.value,
    );
  }

  switch (sortBy.value) {
    case "name-desc":
      return items.sort((a, b) => (b.name ?? "").localeCompare(a.name ?? ""));
    case "stock-desc":
      return items.sort(
        (a, b) => (b.stock_quantity ?? 0) - (a.stock_quantity ?? 0),
      );
    case "stock-asc":
      return items.sort(
        (a, b) => (a.stock_quantity ?? 0) - (b.stock_quantity ?? 0),
      );
    case "min-desc":
      return items.sort(
        (a, b) =>
          (b.minimum_stock_quantity ?? 0) - (a.minimum_stock_quantity ?? 0),
      );
    case "min-asc":
      return items.sort(
        (a, b) =>
          (a.minimum_stock_quantity ?? 0) - (b.minimum_stock_quantity ?? 0),
      );
    default:
      return items.sort((a, b) => (a.name ?? "").localeCompare(b.name ?? ""));
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
              Warehouse Inventory
            </p>
            <h1 class="mt-2 text-2xl font-semibold">Inventory Overview</h1>
            <p class="mt-2 text-sm text-slate-600">
              Review stock across all warehouses and take quick actions on inventory.
            </p>
          </div>
        </div>
      </section>

      <UCard v-if="!hasAccess">
        <p class="text-sm text-slate-600">
          You do not have permission to view warehouse inventory.
        </p>
      </UCard>

      <div v-else class="space-y-4">
        <UCard>
          <div class="flex flex-wrap items-center gap-3">
            <UInput
              :model-value="search"
              class="w-64"
              icon="i-lucide-search"
              placeholder="Search inventory"
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
              v-model="statusFilter"
              :items="statusOptions"
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

        <AdminInventoryTable
          :products="visibleProducts"
          :warehouse-for="warehouseForProduct"
          :status-for="statusForProduct"
        />
      </div>
    </div>
  </div>
</template>
