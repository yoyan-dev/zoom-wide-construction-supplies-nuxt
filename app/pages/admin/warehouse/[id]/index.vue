<script setup lang="ts">
import { storeToRefs } from "pinia";
import StockMovementTable from "~/pages/warehouse/_components/table/StockMovementTable.vue";
import { formatNumber } from "~/utils/format";
import { getWarehouseForId, getWarehouseNameById } from "~/utils/warehouse";
import WarehouseStaffModal from "../_components/modals/WarehouseStaffModal.vue";
import { useModal } from "~/composables/admin/useModal";

definePageMeta({
  layout: "admin",
});

const route = useRoute();
const router = useRouter();
const warehouseId = computed(() => String(route.params.id));

const warehouseStore = useWarehouseStore();
const warehouseUsersStore = useWarehouseUsersStore();
const inventoryStore = useInventoryStore();
const productStore = useProductStore();
const transferStore = useWarehouseTransfersStore();

await Promise.all([
  warehouseStore.fetchWarehouseById(warehouseId.value),
  warehouseUsersStore.fetchUsers(),
  productStore.fetchProducts(),
  inventoryStore.fetchInventoryLogs(),
  warehouseStore.fetchWarehouses(),
]);

const { warehouse, warehouses } = storeToRefs(warehouseStore);
const { users, assignments } = storeToRefs(warehouseUsersStore);
const { products } = storeToRefs(productStore);
const { logs, inventoryMeta } = storeToRefs(inventoryStore);

const { openModal } = useModal();

const warehouseName = computed(() => warehouse.value?.name ?? "");

const staff = computed(() =>
  users.value.filter((user) =>
    (assignments.value[user.id] ?? []).includes(warehouseName.value),
  ),
);

const warehouseForProduct = (productId: string) => {
  const product = products.value.find((item) => item.id === productId);
  return (
    inventoryMeta.value[productId]?.warehouse ??
    getWarehouseNameById(product?.warehouse_id, warehouses.value) ??
    getWarehouseForId(productId)
  );
};

const warehouseProducts = computed(() =>
  products.value.filter((product) =>
    product.id ? warehouseForProduct(product.id) === warehouseName.value : false,
  ),
);

const lowStockCount = computed(() =>
  warehouseProducts.value.filter(
    (product) =>
      (product.stock_quantity ?? 0) <= (product.minimum_stock_quantity ?? 0),
  ).length,
);

const recentLogs = computed(() => {
  const allowedProductIds = new Set(
    warehouseProducts.value.map((product) => product.id),
  );
  return logs.value
    .filter((log) => allowedProductIds.has(log.product_id))
    .slice(0, 6);
});

const parseTransferNote = (note?: string | null) => {
  const match = /Transfer\s(.+?)\s->\s(.+?)(?:\.|$)/i.exec(note ?? "");
  return {
    source: match?.[1]?.trim() ?? "Unknown",
    destination: match?.[2]?.trim() ?? "Unknown",
  };
};

const pendingTransfers = computed(() => {
  const transfers = logs.value
    .filter((log) => log.reference_type === "transfer")
    .filter((log) => log.movement_type === "out")
    .map((log) => {
      const parsed = parseTransferNote(log.note);
      return {
        id: log.id,
        source: parsed.source,
        destination: parsed.destination,
        quantity: Math.abs(log.quantity_change),
        status: transferStore.getStatus(log.id),
        created_at: log.created_at,
      };
    })
    .filter(
      (transfer) =>
        transfer.source === warehouseName.value ||
        transfer.destination === warehouseName.value,
    );

  return transfers.filter(
    (transfer) => transfer.status !== "received" && transfer.status !== "cancelled",
  );
});

const goBack = () => router.push("/admin/warehouse");
const editWarehouse = () =>
  router.push(`/admin/warehouse/edit/${warehouseId.value}`);

const openAssignStaff = () => {
  if (!warehouse.value) return;
  openModal(WarehouseStaffModal, {
    warehouse: warehouse.value,
    users: users.value,
    assignments: assignments.value,
  });
};

const viewInventory = () =>
  router.push(`/admin/warehouse/inventory?warehouse=${warehouseId.value}`);

const viewTransfers = () =>
  router.push(`/admin/warehouse/transfers?warehouse=${warehouseId.value}`);
</script>

<template>
  <div class="min-h-screen">
    <div class="space-y-6">
      <section class="bg-white p-2">
        <div class="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p class="text-xs uppercase tracking-[0.18em] text-slate-500">
              Warehouse Details
            </p>
            <h1 class="mt-2 text-2xl font-semibold">
              {{ warehouse?.name ?? "Warehouse" }}
            </h1>
            <p class="mt-2 text-sm text-slate-600">
              Review warehouse operations, staffing, and inventory summaries.
            </p>
          </div>
          <div class="flex flex-wrap items-center gap-2">
            <UButton color="neutral" variant="outline" @click="goBack">
              Back to Warehouses
            </UButton>
            <UButton color="primary" @click="editWarehouse">Edit Warehouse</UButton>
          </div>
        </div>
      </section>

      <UCard v-if="!warehouse">
        <p class="text-sm text-slate-600">
          Warehouse not found. Check the URL or return to the warehouses list.
        </p>
      </UCard>

      <div v-else class="space-y-6">
        <UCard>
          <div class="grid gap-4 md:grid-cols-3">
            <div>
              <p class="text-xs uppercase tracking-[0.18em] text-slate-500">
                Address
              </p>
              <p class="mt-2 text-sm text-slate-600">{{ warehouse.address }}</p>
            </div>
            <div>
              <p class="text-xs uppercase tracking-[0.18em] text-slate-500">
                Capacity
              </p>
              <p class="mt-2 text-lg font-semibold text-slate-800">
                {{ formatNumber(warehouse.capacity) }} units
              </p>
            </div>
            <div>
              <p class="text-xs uppercase tracking-[0.18em] text-slate-500">
                Status
              </p>
              <p class="mt-2 text-sm text-slate-600">{{ warehouse.status }}</p>
            </div>
          </div>
        </UCard>

        <UCard>
          <div class="mb-4 flex items-center justify-between">
            <div>
              <p class="text-xs uppercase tracking-[0.18em] text-slate-500">
                Assigned Warehouse Staff
              </p>
              <p class="mt-1 text-lg font-semibold">Team members</p>
            </div>
            <UButton color="primary" variant="outline" @click="openAssignStaff">
              Assign Staff
            </UButton>
          </div>
          <div class="space-y-3">
            <div
              v-for="member in staff"
              :key="member.id"
              class="flex items-center justify-between rounded-lg border border-slate-200/70 p-3"
            >
              <div>
                <p class="text-sm font-medium text-slate-800">
                  {{ member.full_name }}
                </p>
                <p class="text-xs text-slate-500">{{ member.role }}</p>
              </div>
              <div class="text-sm text-slate-600">{{ member.email }}</div>
            </div>
            <p v-if="!staff.length" class="text-sm text-slate-500">
              No staff assigned yet.
            </p>
          </div>
        </UCard>

        <UCard>
          <div class="grid gap-4 md:grid-cols-3">
            <div>
              <p class="text-xs uppercase tracking-[0.18em] text-slate-500">
                Inventory Items
              </p>
              <p class="mt-2 text-2xl font-semibold">
                {{ warehouseProducts.length }}
              </p>
            </div>
            <div>
              <p class="text-xs uppercase tracking-[0.18em] text-slate-500">
                Low Stock Alerts
              </p>
              <p class="mt-2 text-2xl font-semibold">
                {{ lowStockCount }}
              </p>
            </div>
            <div>
              <p class="text-xs uppercase tracking-[0.18em] text-slate-500">
                Recent Transfers
              </p>
              <p class="mt-2 text-2xl font-semibold">
                {{ pendingTransfers.length }}
              </p>
            </div>
          </div>
          <div class="mt-4 flex gap-2">
            <UButton color="primary" variant="outline" @click="viewInventory">
              View Inventory
            </UButton>
            <UButton color="primary" variant="outline" @click="viewTransfers">
              View Transfers
            </UButton>
          </div>
        </UCard>

        <StockMovementTable :logs="recentLogs" :products="products" />

        <UCard>
          <div class="mb-4">
            <p class="text-xs uppercase tracking-[0.18em] text-slate-500">
              Pending Transfers
            </p>
            <p class="mt-1 text-lg font-semibold">Awaiting completion</p>
          </div>
          <div class="space-y-3">
            <div
              v-for="transfer in pendingTransfers"
              :key="transfer.id"
              class="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-slate-200/70 p-3"
            >
              <div>
                <p class="text-sm font-medium text-slate-800">
                  Transfer {{ transfer.id }}
                </p>
                <p class="text-xs text-slate-500">
                  {{ transfer.source }} ? {{ transfer.destination }}
                </p>
              </div>
              <div class="text-sm text-slate-600">
                {{ transfer.quantity }} units | {{ transfer.status }}
              </div>
            </div>
            <p v-if="!pendingTransfers.length" class="text-sm text-slate-500">
              No pending transfers for this warehouse.
            </p>
          </div>
        </UCard>
      </div>
    </div>
  </div>
</template>
