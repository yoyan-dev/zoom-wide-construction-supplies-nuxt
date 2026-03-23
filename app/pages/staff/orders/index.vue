<script setup lang="ts">
import { storeToRefs } from "pinia";
import StaffOrdersOverview from "./_components/StaffOrdersOverview.vue";
import StaffOrdersTable from "./_components/StaffOrdersTable.vue";

definePageMeta({
  layout: "staff",
});

const orderStore = useOrderStore();
const customerStore = useCustomerStore();
const deliveryStore = useDeliveryStore();
const productStore = useProductStore();

await Promise.all([
  orderStore.fetchOrders(),
  customerStore.fetchCustomers(),
  deliveryStore.fetchDeliveries(),
  productStore.fetchProducts(),
]);

const { orders, orderItems } = storeToRefs(orderStore);
const { customers } = storeToRefs(customerStore);
const { deliveries } = storeToRefs(deliveryStore);
const { products } = storeToRefs(productStore);

const sortedOrders = computed(() =>
  [...orders.value].sort(
    (left, right) =>
      new Date(right.updated_at).getTime() - new Date(left.updated_at).getTime(),
  ),
);

const customersById = computed(() =>
  Object.fromEntries(customers.value.map((customer) => [customer.id, customer])),
);

const deliveriesByOrderId = computed(() =>
  Object.fromEntries(deliveries.value.map((delivery) => [delivery.order_id, delivery])),
);

const productsById = computed(() =>
  Object.fromEntries(
    products.value
      .filter((product) => product.id)
      .map((product) => [product.id as string, product]),
  ),
);

const orderItemsByOrderId = computed(() => {
  const grouped: Record<string, typeof orderItems.value> = {};
  for (const item of orderItems.value) {
    if (!grouped[item.order_id]) grouped[item.order_id] = [];
    grouped[item.order_id].push(item);
  }
  return grouped;
});

const needsReview = computed(
  () =>
    orders.value.filter(
      (order) => order.status === "pending" || order.status === "rejected",
    ).length,
);

const activeDeliveryOrders = computed(
  () =>
    deliveries.value.filter(
      (delivery) =>
        delivery.status === "scheduled" || delivery.status === "in_transit",
    ).length,
);

const completed = computed(
  () => orders.value.filter((order) => order.status === "completed").length,
);
</script>

<template>
  <div class="min-h-screen space-y-6">
    <StaffOrdersOverview
      :total="orders.length"
      :needs-review="needsReview"
      :active-delivery-orders="activeDeliveryOrders"
      :completed="completed"
    />

    <StaffOrdersTable
      :orders="sortedOrders"
      :customers-by-id="customersById"
      :deliveries-by-order-id="deliveriesByOrderId"
      :order-items-by-order-id="orderItemsByOrderId"
      :products-by-id="productsById"
    />
  </div>
</template>
