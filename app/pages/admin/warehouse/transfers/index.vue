<script setup lang="ts">
import { storeToRefs } from "pinia";
import type { UserRole } from "~/types/user";
import type { WarehouseTransfer } from "~/types/warehouse-transfer";
import AdminTransfersTable from "../_components/table/AdminTransfersTable.vue";

definePageMeta({
  layout: "admin",
});

const inventoryStore = useInventoryStore();
const productStore = useProductStore();
const warehouseStore = useWarehouseStore();
const transferStore = useWarehouseTransfersStore();

await Promise.all([
  inventoryStore.fetchInventoryLogs(),
  productStore.fetchProducts(),
  warehouseStore.fetchWarehouses(),
]);

const { logs } = storeToRefs(inventoryStore);
const { products } = storeToRefs(productStore);
const { warehouses } = storeToRefs(warehouseStore);

const role = useState<UserRole>("current-role", () => "admin");
const hasAccess = computed(() => role.value === "admin");

const route = useRoute();

const search = ref("");
const warehouseFilter = ref("all");
const statusFilter = ref("all");
const sortBy = ref("date-desc");

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

const parseTransferNote = (note: string | null) => {
  const match = /Transfer\s(.+?)\s->\s(.+?)(?:\.|$)/i.exec(note ?? "");
  if (!match) {
    return { source: "Unknown", destination: "Unknown" };
  }
  return {
    source: match[1].trim(),
    destination: match[2].trim(),
  };
};

const transferLogs = computed(() =>
  logs.value.filter((log) => log.reference_type === "transfer"),
);

const baseTransferLogs = computed(() => {
  const outbound = transferLogs.value.filter((log) => log.movement_type === "out");
  return outbound.length ? outbound : transferLogs.value;
});

const transfers = computed<WarehouseTransfer[]>(() =>
  baseTransferLogs.value.map((log) => {
    const parsed = parseTransferNote(log.note ?? null);
    const id = log.reference_id ?? log.id;
    return {
      id,
      product_id: log.product_id,
      source_warehouse: parsed.source,
      destination_warehouse: parsed.destination,
      quantity: Math.abs(log.quantity_change),
      status: transferStore.getStatus(id),
      created_at: log.created_at,
    };
  }),
);

const warehouseOptions = computed(() => [
  { label: "All warehouses", value: "all" },
  ...warehouses.value.map((warehouse) => ({
    label: warehouse.name,
    value: warehouse.name,
  })),
]);

const statusOptions = [
  { label: "All statuses", value: "all" },
  { label: "Pending", value: "pending" },
  { label: "Approved", value: "approved" },
  { label: "In Transit", value: "in_transit" },
  { label: "Received", value: "received" },
  { label: "Cancelled", value: "cancelled" },
];

const sortOptions = [
  { label: "Date (Newest)", value: "date-desc" },
  { label: "Date (Oldest)", value: "date-asc" },
  { label: "Quantity (High-Low)", value: "quantity-desc" },
  { label: "Quantity (Low-High)", value: "quantity-asc" },
];

const filteredTransfers = computed(() => {
  const term = search.value.trim().toLowerCase();
  let items = [...transfers.value];

  if (warehouseFilter.value !== "all") {
    items = items.filter(
      (transfer) =>
        transfer.source_warehouse === warehouseFilter.value ||
        transfer.destination_warehouse === warehouseFilter.value,
    );
  }

  if (statusFilter.value !== "all") {
    items = items.filter((transfer) => transfer.status === statusFilter.value);
  }

  if (term) {
    const productMap = new Map(
      products.value.map((product) => [
        product.id ?? "",
        `${product.name ?? ""} ${product.sku ?? ""}`.toLowerCase(),
      ]),
    );

    items = items.filter((transfer) => {
      const productText = productMap.get(transfer.product_id) ?? "";
      return (
        transfer.id.toLowerCase().includes(term) ||
        transfer.source_warehouse.toLowerCase().includes(term) ||
        transfer.destination_warehouse.toLowerCase().includes(term) ||
        productText.includes(term)
      );
    });
  }

  switch (sortBy.value) {
    case "date-asc":
      return items.sort(
        (a, b) =>
          new Date(a.created_at).getTime() -
          new Date(b.created_at).getTime(),
      );
    case "quantity-desc":
      return items.sort((a, b) => b.quantity - a.quantity);
    case "quantity-asc":
      return items.sort((a, b) => a.quantity - b.quantity);
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
              Stock Transfers
            </p>
            <h1 class="mt-2 text-2xl font-semibold">Warehouse Transfers</h1>
            <p class="mt-2 text-sm text-slate-600">
              Manage warehouse-to-warehouse transfers and approvals.
            </p>
          </div>
        </div>
      </section>

      <UCard v-if="!hasAccess">
        <p class="text-sm text-slate-600">
          You do not have permission to view stock transfers.
        </p>
      </UCard>

      <div v-else class="space-y-4">
        <UCard>
          <div class="flex flex-wrap items-center gap-3">
            <UInput
              v-model="search"
              class="w-64"
              icon="i-lucide-search"
              placeholder="Search transfers"
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

        <AdminTransfersTable :transfers="filteredTransfers" :products="products" />
      </div>
    </div>
  </div>
</template>