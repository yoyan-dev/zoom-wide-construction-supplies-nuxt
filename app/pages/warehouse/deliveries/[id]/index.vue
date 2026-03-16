<script setup lang="ts">
import { storeToRefs } from "pinia";
import { formatLongDate } from "~/utils/format";
import {
  defaultAssignedWarehouses,
  getWarehouseForId,
} from "~/utils/warehouse";

definePageMeta({
  layout: "warehouse",
});

const route = useRoute();
const router = useRouter();
const deliveryId = computed(() => String(route.params.id));

const deliveryStore = useDeliveryStore();
const orderStore = useOrderStore();
const driverStore = useDriverStore();

await Promise.all([
  deliveryStore.fetchDeliveryById(deliveryId.value),
  orderStore.fetchOrders(),
  driverStore.fetchDrivers(),
]);

const { delivery, deliveryActivity, deliveryMeta } = storeToRefs(deliveryStore);
const { orders, orderItems } = storeToRefs(orderStore);
const { drivers } = storeToRefs(driverStore);

const assignedWarehouses = defaultAssignedWarehouses;

if (!deliveryMeta.value[deliveryId.value]?.warehouse_staff) {
  deliveryStore.updateDeliveryMeta(deliveryId.value, {
    warehouse_staff: getWarehouseForId(deliveryId.value),
  });
}

const warehouseAssignment = computed(() =>
  deliveryMeta.value[deliveryId.value]?.warehouse_staff ??
    getWarehouseForId(deliveryId.value),
);

const hasAccess = computed(() =>
  assignedWarehouses.includes(warehouseAssignment.value),
);

const order = computed(() =>
  orders.value.find((item) => item.id === delivery.value?.order_id),
);

const driver = computed(() =>
  drivers.value.find((item) => item.id === delivery.value?.driver_id),
);

const items = computed(() =>
  orderItems.value.filter(
    (item) => item.order_id === delivery.value?.order_id,
  ),
);

const activity = computed(() =>
  deliveryActivity.value[deliveryId.value] ?? [],
);

const meta = computed(() => deliveryMeta.value[deliveryId.value] ?? {});

const goBack = () => router.push("/warehouse");
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
              Delivery Overview
            </p>
            <h1 class="mt-2 text-2xl font-semibold">
              Delivery {{ delivery?.id ?? "Not found" }}
            </h1>
            <p class="mt-2 text-sm text-slate-600">
              Track assigned deliveries and status updates.
            </p>
          </div>
          <div class="flex flex-wrap items-center gap-2">
            <UButton color="neutral" variant="outline" @click="goBack">
              Back to Dashboard
            </UButton>
          </div>
        </div>
      </section>

      <UCard v-if="!hasAccess">
        <p class="text-sm text-slate-600">
          This delivery is assigned to {{ warehouseAssignment }}. You can only
          view deliveries for {{ assignedWarehouses.join(", ") }}.
        </p>
      </UCard>

      <div v-else-if="delivery">
        <UCard>
          <div class="grid gap-4 md:grid-cols-3">
            <div>
              <p class="text-xs uppercase tracking-[0.18em] text-slate-500">
                Status
              </p>
              <p class="mt-2 text-lg font-semibold text-slate-800">
                {{ delivery.status }}
              </p>
            </div>
            <div>
              <p class="text-xs uppercase tracking-[0.18em] text-slate-500">
                Order
              </p>
              <p class="mt-2 text-lg font-semibold text-slate-800">
                {{ delivery.order_id }}
              </p>
            </div>
            <div>
              <p class="text-xs uppercase tracking-[0.18em] text-slate-500">
                Driver
              </p>
              <p class="mt-2 text-lg font-semibold text-slate-800">
                {{ driver?.name ?? delivery.driver_id ?? "Unassigned" }}
              </p>
              <p class="text-sm text-slate-500">
                {{ delivery.vehicle_number ?? "No vehicle assigned" }}
              </p>
            </div>
          </div>
        </UCard>

        <UCard>
          <div class="grid gap-4 md:grid-cols-2">
            <div>
              <p class="text-xs uppercase tracking-[0.18em] text-slate-500">
                Scheduled at
              </p>
              <p class="mt-2 text-sm text-slate-600">
                {{
                  delivery.scheduled_at
                    ? formatLongDate(delivery.scheduled_at)
                    : "TBD"
                }}
              </p>
            </div>
            <div>
              <p class="text-xs uppercase tracking-[0.18em] text-slate-500">
                Delivered at
              </p>
              <p class="mt-2 text-sm text-slate-600">
                {{
                  delivery.delivered_at
                    ? formatLongDate(delivery.delivered_at)
                    : "Not delivered"
                }}
              </p>
            </div>
            <div>
              <p class="text-xs uppercase tracking-[0.18em] text-slate-500">
                Warehouse assignment
              </p>
              <p class="mt-2 text-sm text-slate-600">
                {{ warehouseAssignment }}
              </p>
            </div>
            <div>
              <p class="text-xs uppercase tracking-[0.18em] text-slate-500">
                Updated
              </p>
              <p class="mt-2 text-sm text-slate-600">
                {{ formatLongDate(delivery.updated_at) }}
              </p>
            </div>
          </div>
        </UCard>

        <UCard>
          <div class="mb-4">
            <p class="text-xs uppercase tracking-[0.18em] text-slate-500">
              Delivery Items
            </p>
            <p class="mt-1 text-lg font-semibold">Items on this load</p>
          </div>
          <div class="space-y-3">
            <div
              v-for="item in items"
              :key="item.id"
              class="flex items-center justify-between rounded-lg border border-slate-200/70 p-3"
            >
              <div>
                <p class="text-sm font-medium text-slate-800">
                  {{ item.product_id }}
                </p>
                <p class="text-xs text-slate-500">Item ID {{ item.id }}</p>
              </div>
              <div class="text-sm text-slate-600">
                {{ item.quantity }} x {{ item.unit_price }}
              </div>
            </div>
            <p v-if="!items.length" class="text-sm text-slate-500">
              No items associated with this delivery.
            </p>
          </div>
        </UCard>

        <UCard>
          <div class="mb-4">
            <p class="text-xs uppercase tracking-[0.18em] text-slate-500">
              Tracking
            </p>
            <p class="mt-1 text-lg font-semibold">Live updates</p>
          </div>
          <div class="grid gap-4 md:grid-cols-2">
            <div>
              <p class="text-xs uppercase tracking-[0.18em] text-slate-500">
                Last location
              </p>
              <p class="mt-2 text-sm text-slate-600">
                {{ meta.location ?? "No location updates." }}
              </p>
            </div>
            <div>
              <p class="text-xs uppercase tracking-[0.18em] text-slate-500">
                Route
              </p>
              <p class="mt-2 text-sm text-slate-600">
                {{ meta.route ?? "No route assigned." }}
              </p>
            </div>
          </div>
        </UCard>

        <UCard>
          <div class="mb-4">
            <p class="text-xs uppercase tracking-[0.18em] text-slate-500">
              Timeline
            </p>
            <p class="mt-1 text-lg font-semibold">Delivery activity</p>
          </div>
          <div v-if="activity.length" class="space-y-3">
            <div
              v-for="entry in activity"
              :key="entry.at + entry.action"
              class="rounded-lg border border-slate-200/70 p-3"
            >
              <p class="text-sm font-medium text-slate-800">
                {{ entry.action }}
              </p>
              <p class="text-xs text-slate-500">
                {{ formatLongDate(entry.at) }}
              </p>
              <p v-if="entry.detail" class="text-xs text-slate-500">
                {{ entry.detail }}
              </p>
            </div>
          </div>
          <p v-else class="text-sm text-slate-500">
            No timeline updates yet.
          </p>
        </UCard>
      </div>

      <UCard v-else>
        <p class="text-sm text-slate-600">
          Delivery not found. Check the URL or return to the dashboard.
        </p>
      </UCard>
    </div>
  </div>
</template>
