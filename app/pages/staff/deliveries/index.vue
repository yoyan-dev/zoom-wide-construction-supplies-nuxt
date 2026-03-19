<script setup lang="ts">
import { storeToRefs } from "pinia";
import StaffDeliveriesOverview from "./_components/StaffDeliveriesOverview.vue";
import StaffDeliveriesTable from "./_components/StaffDeliveriesTable.vue";

definePageMeta({
  layout: "staff",
});

const deliveryStore = useDeliveryStore();
const driverStore = useDriverStore();
const orderStore = useOrderStore();
const customerStore = useCustomerStore();

await Promise.all([
  deliveryStore.fetchDeliveries(),
  driverStore.fetchDrivers(),
  orderStore.fetchOrders(),
  customerStore.fetchCustomers(),
]);

const { deliveries } = storeToRefs(deliveryStore);
const { drivers } = storeToRefs(driverStore);
const { orders } = storeToRefs(orderStore);
const { customers } = storeToRefs(customerStore);

const sortedDeliveries = computed(() =>
  [...deliveries.value].sort((left, right) => {
    const leftDate = left.scheduled_at ?? left.updated_at;
    const rightDate = right.scheduled_at ?? right.updated_at;
    return new Date(rightDate).getTime() - new Date(leftDate).getTime();
  }),
);

const driversById = computed(() =>
  Object.fromEntries(drivers.value.map((driver) => [driver.id, driver])),
);

const ordersById = computed(() =>
  Object.fromEntries(orders.value.map((order) => [order.id, order])),
);

const customersById = computed(() =>
  Object.fromEntries(customers.value.map((customer) => [customer.id, customer])),
);

const scheduled = computed(
  () => deliveries.value.filter((delivery) => delivery.status === "scheduled").length,
);

const inTransit = computed(
  () => deliveries.value.filter((delivery) => delivery.status === "in_transit").length,
);

const attention = computed(
  () =>
    deliveries.value.filter(
      (delivery) =>
        delivery.status === "failed" ||
        (delivery.status === "scheduled" && !delivery.driver_id),
    ).length,
);
</script>

<template>
  <div class="min-h-screen space-y-6">
    <StaffDeliveriesOverview
      :total="deliveries.length"
      :scheduled="scheduled"
      :in-transit="inTransit"
      :attention="attention"
    />

    <StaffDeliveriesTable
      :deliveries="sortedDeliveries"
      :drivers-by-id="driversById"
      :orders-by-id="ordersById"
      :customers-by-id="customersById"
    />
  </div>
</template>
