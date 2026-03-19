<script setup lang="ts">
import { storeToRefs } from "pinia";
import StaffReportsOverview from "./_components/StaffReportsOverview.vue";
import StaffReportsPanels from "./_components/StaffReportsPanels.vue";

definePageMeta({
  layout: "staff",
});

const orderStore = useOrderStore();
const deliveryStore = useDeliveryStore();
const productStore = useProductStore();
const customerStore = useCustomerStore();

await Promise.all([
  orderStore.fetchOrders(),
  deliveryStore.fetchDeliveries(),
  productStore.fetchProducts(),
  customerStore.fetchCustomers(),
]);

const { orders } = storeToRefs(orderStore);
const { deliveries } = storeToRefs(deliveryStore);
const { products } = storeToRefs(productStore);
const { customers } = storeToRefs(customerStore);

const lowStockProducts = computed(() =>
  products.value
    .filter((product) => {
      const minimum = product.minimum_stock_quantity ?? 0;
      return minimum > 0 && (product.stock_quantity ?? 0) <= minimum;
    })
    .sort((left, right) => (left.stock_quantity ?? 0) - (right.stock_quantity ?? 0))
    .slice(0, 4),
);

const orderSummary = computed(() => [
  {
    label: "Pending",
    value: orders.value.filter((order) => order.status === "pending").length,
    tone: "warning" as const,
  },
  {
    label: "Approved",
    value: orders.value.filter((order) => order.status === "approved").length,
    tone: "info" as const,
  },
  {
    label: "Completed",
    value: orders.value.filter((order) => order.status === "completed").length,
    tone: "success" as const,
  },
  {
    label: "Rejected",
    value: orders.value.filter((order) => order.status === "rejected").length,
    tone: "error" as const,
  },
]);

const deliverySummary = computed(() => [
  {
    label: "Scheduled",
    value: deliveries.value.filter((delivery) => delivery.status === "scheduled").length,
    tone: "warning" as const,
  },
  {
    label: "In Transit",
    value: deliveries.value.filter((delivery) => delivery.status === "in_transit").length,
    tone: "info" as const,
  },
  {
    label: "Delivered",
    value: deliveries.value.filter((delivery) => delivery.status === "delivered").length,
    tone: "success" as const,
  },
  {
    label: "Attention",
    value: deliveries.value.filter((delivery) => !delivery.driver_id).length,
    tone: "error" as const,
  },
]);

const customerCoverage = computed(() => {
  const counts = orders.value.reduce<Record<string, number>>((acc, order) => {
    acc[order.customer_id] = (acc[order.customer_id] ?? 0) + 1;
    return acc;
  }, {});

  return customers.value
    .map((customer) => ({
      id: customer.id,
      company: customer.company_name,
      orders: counts[customer.id] ?? 0,
    }))
    .sort((left, right) => right.orders - left.orders)
    .slice(0, 4);
});
</script>

<template>
  <div class="min-h-screen space-y-6">
    <StaffReportsOverview
      :total-orders="orders.length"
      :active-deliveries="deliveries.filter((delivery) => delivery.status === 'scheduled' || delivery.status === 'in_transit').length"
      :low-stock="lowStockProducts.length"
      :customers="customers.length"
    />

    <StaffReportsPanels
      :order-summary="orderSummary"
      :delivery-summary="deliverySummary"
      :stock-risks="lowStockProducts.map((product) => ({
        id: product.id ?? product.sku ?? product.name ?? 'product',
        name: product.name ?? 'Unnamed product',
        stock: product.stock_quantity ?? 0,
        minimum: product.minimum_stock_quantity ?? 0,
        unit: product.unit ?? 'units',
      }))"
      :customer-coverage="customerCoverage"
    />
  </div>
</template>
