<script setup lang="ts">
import { storeToRefs } from "pinia";
import type { Order } from "~/types/order";
import StaffCustomersOverview from "./_components/StaffCustomersOverview.vue";
import StaffCustomersTable from "./_components/StaffCustomersTable.vue";

definePageMeta({
  layout: "staff",
});

const customerStore = useCustomerStore();
const orderStore = useOrderStore();

await Promise.all([customerStore.fetchCustomers(), orderStore.fetchOrders()]);

const { customers } = storeToRefs(customerStore);
const { orders } = storeToRefs(orderStore);

const sortedCustomers = computed(() =>
  [...customers.value].sort(
    (left, right) =>
      new Date(right.updated_at).getTime() - new Date(left.updated_at).getTime(),
  ),
);

const orderCountByCustomer = computed(() =>
  orders.value.reduce<Record<string, number>>((acc, order) => {
    acc[order.customer_id] = (acc[order.customer_id] ?? 0) + 1;
    return acc;
  }, {}),
);

const latestOrderByCustomer = computed(() =>
  orders.value.reduce<Record<string, Order | undefined>>((acc, order) => {
    const current = acc[order.customer_id];
    if (!current || new Date(order.updated_at).getTime() > new Date(current.updated_at).getTime()) {
      acc[order.customer_id] = order;
    }
    return acc;
  }, {}),
);

const withOpenOrders = computed(
  () =>
    new Set(
      orders.value
        .filter((order) => order.status === "pending" || order.status === "approved")
        .map((order) => order.customer_id),
    ).size,
);

const pendingFollowUps = computed(
  () => orders.value.filter((order) => order.status === "rejected").length,
);

const recentAccounts = computed(() => sortedCustomers.value.slice(0, 3).length);
</script>

<template>
  <div class="min-h-screen space-y-6">
    <StaffCustomersOverview
      :total="customers.length"
      :with-open-orders="withOpenOrders"
      :pending-follow-ups="pendingFollowUps"
      :recent-accounts="recentAccounts"
    />

    <StaffCustomersTable
      :customers="sortedCustomers"
      :order-count-by-customer="orderCountByCustomer"
      :latest-order-by-customer="latestOrderByCustomer"
    />
  </div>
</template>
