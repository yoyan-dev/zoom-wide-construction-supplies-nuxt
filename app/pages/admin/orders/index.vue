<script setup lang="ts">
import { storeToRefs } from "pinia";
import OrdersHeader from "./_components/OrdersHeader.vue";
import OrdersTable from "./_components/OrdersTable.vue";

definePageMeta({
  layout: "admin",
});

const orderStore = useOrderStore();
const customerStore = useCustomerStore();

await Promise.all([
  orderStore.fetchOrders(),
  customerStore.fetchCustomers(),
]);

const { orders } = storeToRefs(orderStore);
const { customers } = storeToRefs(customerStore);
</script>

<template>
  <div class="min-h-screen">
    <div class="space-y-6">
      <OrdersHeader :total="orders.length" />
      <OrdersTable :orders="orders" :customers="customers" />
    </div>
  </div>
</template>
