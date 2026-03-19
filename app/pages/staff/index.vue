<script setup lang="ts">
import { storeToRefs } from "pinia";
import StaffActivityFeed from "./_components/StaffActivityFeed.vue";
import StaffCustomerConcerns from "./_components/StaffCustomerConcerns.vue";
import StaffDeliveryOverview from "./_components/StaffDeliveryOverview.vue";
import StaffPageHeader from "./_components/StaffPageHeader.vue";
import StaffPendingTasks from "./_components/StaffPendingTasks.vue";
import StaffQuickActions from "./_components/StaffQuickActions.vue";
import StaffRecentOrders from "./_components/StaffRecentOrders.vue";
import StaffStatsGrid from "./_components/StaffStatsGrid.vue";
import StaffStockAlerts from "./_components/StaffStockAlerts.vue";
import {
  buildStaffActivityFeed,
  buildStaffCustomerConcerns,
  buildStaffDeliveries,
  buildStaffDeliverySummary,
  buildStaffPendingTasks,
  buildStaffQuickActions,
  buildStaffRecentOrders,
  buildStaffStats,
  buildStaffStockAlerts,
  getLowStockProducts,
} from "./_components/staff-dashboard.builders";
import { staffQuickActionTemplates } from "./_components/staff-dashboard.data";

definePageMeta({
  layout: "staff",
});

const orderStore = useOrderStore();
const deliveryStore = useDeliveryStore();
const productStore = useProductStore();
const customerStore = useCustomerStore();
const driverStore = useDriverStore();

await Promise.all([
  orderStore.fetchOrders(),
  deliveryStore.fetchDeliveries(),
  productStore.fetchProducts(),
  customerStore.fetchCustomers(),
  driverStore.fetchDrivers(),
]);

const { orders, orderItems } = storeToRefs(orderStore);
const { deliveries } = storeToRefs(deliveryStore);
const { products } = storeToRefs(productStore);
const { customers } = storeToRefs(customerStore);
const { drivers } = storeToRefs(driverStore);

const customersById = computed(() =>
  Object.fromEntries(customers.value.map((customer) => [customer.id, customer])),
);

const productsById = computed(() =>
  Object.fromEntries(
    products.value
      .filter((product) => product.id)
      .map((product) => [product.id as string, product]),
  ),
);

const ordersById = computed(() =>
  Object.fromEntries(orders.value.map((order) => [order.id, order])),
);

const driversById = computed(() =>
  Object.fromEntries(drivers.value.map((driver) => [driver.id, driver])),
);

const deliveriesByOrderId = computed(() =>
  Object.fromEntries(deliveries.value.map((delivery) => [delivery.order_id, delivery])),
);

const orderItemsByOrderId = computed(() => {
  const grouped: Record<string, typeof orderItems.value> = {};

  for (const item of orderItems.value) {
    if (!grouped[item.order_id]) {
      grouped[item.order_id] = [];
    }
    grouped[item.order_id].push(item);
  }

  return grouped;
});

const lowStockProducts = computed(() => getLowStockProducts(products.value));

const pendingTaskRows = computed(() =>
  buildStaffPendingTasks({
    orders: orders.value,
    deliveries: deliveries.value,
    lowStockProducts: lowStockProducts.value,
    customersById: customersById.value,
  }),
);

const customerConcernRows = computed(() =>
  buildStaffCustomerConcerns({
    orders: orders.value,
    deliveries: deliveries.value,
    lowStockProducts: lowStockProducts.value,
    customersById: customersById.value,
  }),
);

const recentOrderRows = computed(() =>
  buildStaffRecentOrders({
    orders: orders.value,
    orderItemsByOrderId: orderItemsByOrderId.value,
    productsById: productsById.value,
    customersById: customersById.value,
    deliveriesByOrderId: deliveriesByOrderId.value,
  }),
);

const stockAlertRows = computed(() =>
  buildStaffStockAlerts(lowStockProducts.value),
);

const deliverySummaryRows = computed(() =>
  buildStaffDeliverySummary(deliveries.value),
);

const deliveryRows = computed(() =>
  buildStaffDeliveries({
    deliveries: deliveries.value,
    ordersById: ordersById.value,
    customersById: customersById.value,
    driversById: driversById.value,
    orderItemsByOrderId: orderItemsByOrderId.value,
    productsById: productsById.value,
  }),
);

const activityRows = computed(() =>
  buildStaffActivityFeed({
    orders: orders.value,
    deliveries: deliveries.value,
    lowStockProducts: lowStockProducts.value,
    customersById: customersById.value,
  }),
);

const ordersToReview = computed(
  () =>
    orders.value.filter(
      (order) => order.status === "pending" || order.status === "rejected",
    ).length,
);

const activeDeliveries = computed(
  () =>
    deliveries.value.filter(
      (delivery) =>
        delivery.status === "scheduled" || delivery.status === "in_transit",
    ).length,
);

const processedToday = computed(
  () =>
    orders.value.filter((order) => {
      const updatedAt = new Date(order.updated_at);
      const today = new Date();
      return (
        updatedAt.toDateString() === today.toDateString() &&
        order.status !== "pending"
      );
    }).length,
);

const staffDashboardStatRows = computed(() =>
  buildStaffStats({
    orders: orders.value,
    deliveries: deliveries.value,
    lowStockProducts: lowStockProducts.value,
    pendingConcerns: customerConcernRows.value.length,
    followUpItems: pendingTaskRows.value.length,
  }),
);

const quickActionRows = computed(() =>
  buildStaffQuickActions({
    templates: staffQuickActionTemplates,
    ordersToReview: ordersToReview.value,
    lowStockCount: lowStockProducts.value.length,
    concernsCount: customerConcernRows.value.length,
    activeDeliveries: activeDeliveries.value,
    processedToday: processedToday.value,
    followUpItems: pendingTaskRows.value.length,
  }),
);
</script>

<template>
  <div class="min-h-screen">
    <div class="space-y-6">
      <StaffPageHeader />

      <StaffStatsGrid :stats="staffDashboardStatRows" />

      <div class="grid gap-6 2xl:grid-cols-12">
        <div class="space-y-6 2xl:col-span-8">
          <StaffQuickActions :actions="quickActionRows" />
          <StaffRecentOrders :orders="recentOrderRows" />

          <div class="grid gap-6 xl:grid-cols-2">
            <StaffPendingTasks :tasks="pendingTaskRows" />
            <StaffDeliveryOverview
              :deliveries="deliveryRows"
              :summary="deliverySummaryRows"
            />
          </div>
        </div>

        <div class="space-y-6 2xl:col-span-4">
          <StaffStockAlerts :alerts="stockAlertRows" />
          <StaffCustomerConcerns :concerns="customerConcernRows" />
          <StaffActivityFeed :items="activityRows" />
        </div>
      </div>
    </div>
  </div>
</template>
