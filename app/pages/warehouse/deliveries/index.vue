<script setup lang="ts">
import { storeToRefs } from "pinia";
import PendingDeliveriesTable from "../_components/table/PendingDeliveriesTable.vue";
import {
  defaultAssignedWarehouses,
  getWarehouseForId,
} from "~/utils/warehouse";

definePageMeta({
  layout: "warehouse",
});

const deliveryStore = useDeliveryStore();
const driverStore = useDriverStore();

await Promise.all([deliveryStore.fetchDeliveries(), driverStore.fetchDrivers()]);

const { deliveries, deliveryMeta } = storeToRefs(deliveryStore);
const { drivers } = storeToRefs(driverStore);

const assignedWarehouses = defaultAssignedWarehouses;

const ensureDeliveryWarehouses = (items: typeof deliveries.value) => {
  for (const delivery of items) {
    if (!deliveryMeta.value[delivery.id]?.warehouse_staff) {
      deliveryStore.updateDeliveryMeta(delivery.id, {
        warehouse_staff: getWarehouseForId(delivery.id),
      });
    }
  }
};

watch(deliveries, (value) => ensureDeliveryWarehouses(value), {
  immediate: true,
});

const warehouseForDelivery = (deliveryId: string) =>
  deliveryMeta.value[deliveryId]?.warehouse_staff ?? getWarehouseForId(deliveryId);

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
              Delivery Queue
            </p>
            <h1 class="mt-2 text-2xl font-semibold">Assigned Deliveries</h1>
            <p class="mt-2 text-sm text-slate-600">
              Track deliveries assigned to your warehouse.
            </p>
          </div>
          <div class="rounded-full border border-slate-200/70 px-4 py-2 text-sm">
            Assigned: {{ assignedWarehouses.join(", ") }}
          </div>
        </div>
      </section>

      <PendingDeliveriesTable :deliveries="pendingDeliveries" :drivers="drivers" />
    </div>
  </div>
</template>
