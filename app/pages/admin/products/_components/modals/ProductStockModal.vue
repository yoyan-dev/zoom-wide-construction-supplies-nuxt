<script setup lang="ts">
import type { Product } from "~/types/product";
import { storeToRefs } from "pinia";
import { formatShortDate } from "~/utils/format";
import { getInventoryBalance } from "~/utils/inventory-balance";
import { getWarehouseNameById } from "~/utils/warehouse";

const props = defineProps<{
  payload: Product | null;
}>();

const emit = defineEmits<{ close: [boolean] }>();
const inventoryStore = useInventoryStore();
const warehouseStore = useWarehouseStore();
const { logs } = storeToRefs(inventoryStore);
const { warehouses } = storeToRefs(warehouseStore);
const currentStock = computed(() =>
  getInventoryBalance(
    logs.value,
    props.payload?.id,
    props.payload?.stock_quantity ?? 0,
  ),
);
const warehouseName = computed(
  () => getWarehouseNameById(props.payload?.warehouse_id, warehouses.value) ?? "Unassigned",
);

onMounted(async () => {
  if (!logs.value.length) {
    await inventoryStore.fetchInventoryLogs();
  }
  if (!warehouses.value.length) {
    await warehouseStore.fetchWarehouses();
  }
});

const movementLogs = computed(() =>
  props.payload?.id
    ? logs.value
        .filter((entry) => entry.product_id === props.payload?.id)
        .slice(0, 5)
    : [],
);
</script>

<template>
  <UModal :close="{ onClick: () => emit('close', false) }">
    <template #header>
      <div>
        <p class="text-xs uppercase tracking-[0.18em] text-slate-500">
          Stock Levels
        </p>
        <h3 class="mt-2 text-lg font-semibold">
          {{ props.payload?.name ?? "Product" }}
        </h3>
      </div>
    </template>
    <template #body>
      <div class="space-y-4 text-sm text-slate-600">
        <div class="grid gap-3 sm:grid-cols-2">
          <div class="rounded-lg border border-slate-200/70 p-3">
            <p class="text-xs uppercase tracking-[0.18em] text-slate-500">
              Current stock
            </p>
            <p class="mt-2 text-lg font-semibold text-slate-800">
              {{ currentStock }}
            </p>
          </div>
          <div class="rounded-lg border border-slate-200/70 p-3">
            <p class="text-xs uppercase tracking-[0.18em] text-slate-500">
              Minimum stock
            </p>
            <p class="mt-2 text-lg font-semibold text-slate-800">
              {{ props.payload?.minimum_stock_quantity ?? 0 }}
            </p>
          </div>
        </div>
        <div class="rounded-lg border border-slate-200/70 p-3">
          <p class="text-xs uppercase tracking-[0.18em] text-slate-500">
            Stock warehouse
          </p>
          <p class="mt-2 text-sm font-semibold text-slate-800">
            {{ warehouseName }}
          </p>
        </div>
        <div>
          <p class="text-xs uppercase tracking-[0.18em] text-slate-500 mb-2">
            Recent movements
          </p>
          <div class="space-y-2">
            <div
              v-for="entry in movementLogs"
              :key="entry.id"
              class="flex items-center justify-between rounded-lg border border-slate-200/70 p-3"
            >
              <div>
                <p class="text-sm font-medium text-slate-800">
                  {{ entry.movement_type }}
                </p>
                <p class="text-xs text-slate-500">
                  {{ formatShortDate(entry.created_at) }}
                </p>
              </div>
              <div class="text-sm font-semibold text-slate-800">
                {{ entry.quantity_change }}
              </div>
            </div>
            <p v-if="!movementLogs.length" class="text-sm text-slate-500">
              No inventory movements recorded yet.
            </p>
          </div>
        </div>
      </div>
    </template>
    <template #footer>
      <div class="flex justify-end w-full">
        <UButton color="neutral" variant="ghost" @click="emit('close', false)">
          Close
        </UButton>
      </div>
    </template>
  </UModal>
</template>
