<script setup lang="ts">
import { storeToRefs } from "pinia";
import type { DeliveryStatus } from "~/types/delivery";
import type { OrderStatus } from "~/types/order";
import type { PaymentStatus } from "~/types/payment";
import AdminPageStateCard from "../_components/AdminPageStateCard.vue";
import { formatCurrency, formatShortDateOrFallback } from "~/utils/format";
import { progressWidthClass } from "~/utils/tailwind";

definePageMeta({
  layout: "admin",
});

type DashboardActivity = {
  id: string;
  label: string;
  detail: string;
  date: string | null;
  icon: string;
};

const orderStore = useOrderStore();
const productStore = useProductStore();
const customerStore = useCustomerStore();
const deliveryStore = useDeliveryStore();
const paymentStore = usePaymentStore();

const { orders, isLoading: isOrdersLoading } = storeToRefs(orderStore);
const { products, isLoading: isProductsLoading } = storeToRefs(productStore);
const { customers, isLoading: isCustomersLoading } = storeToRefs(customerStore);
const { deliveries, isLoading: isDeliveriesLoading } =
  storeToRefs(deliveryStore);
const { payments, isLoading: isPaymentsLoading } = storeToRefs(paymentStore);

const pageError = ref<string | null>(null);
const isRetrying = ref(false);

const loadDashboard = async () => {
  const responses = await Promise.all([
    orderStore.fetchOrders({ q: "", status: "", page: 1 }),
    productStore.fetchProducts({ q: "", page: 1 }),
    customerStore.fetchCustomers({ q: "", page: 1 }),
    deliveryStore.fetchDeliveries({ q: "", status: "", page: 1 }),
    paymentStore.fetchPayments({ q: "", status: "", page: 1 }),
  ]);

  const errorResponse = responses.find(
    (response) => response.status === "error",
  );
  pageError.value = errorResponse?.message ?? null;
};

await loadDashboard();

const isLoading = computed(
  () =>
    isOrdersLoading.value ||
    isProductsLoading.value ||
    isCustomersLoading.value ||
    isDeliveriesLoading.value ||
    isPaymentsLoading.value,
);

const activeProductCount = computed(
  () => products.value.filter((product) => product.is_active !== false).length,
);
const lowStockCount = computed(
  () =>
    products.value.filter(
      (product) =>
        Number(product.stock_quantity ?? 0) <=
          Number(product.minimum_stock_quantity ?? 0) &&
        Number(product.minimum_stock_quantity ?? 0) > 0,
    ).length,
);
const pendingOrders = computed(
  () => orders.value.filter((order) => order.status === "pending").length,
);
const paidPaymentsTotal = computed(() =>
  payments.value
    .filter((payment) => payment.status === "paid")
    .reduce((total, payment) => total + Number(payment.amount ?? 0), 0),
);

const kpiCards = computed(() => [
  {
    title: "Active Products",
    value: String(activeProductCount.value),
    description: `${lowStockCount.value} low-stock alerts`,
    icon: "i-lucide-package",
  },
  {
    title: "Pending Orders",
    value: String(pendingOrders.value),
    description: `${orders.value.length} total orders`,
    icon: "i-lucide-shopping-cart",
  },
  {
    title: "Customers",
    value: String(customers.value.length),
    description: "Registered buyer accounts",
    icon: "i-lucide-users",
  },
  {
    title: "Paid Revenue",
    value: formatCurrency(paidPaymentsTotal.value),
    description: `${payments.value.length} payments tracked`,
    icon: "i-lucide-wallet",
  },
]);

const getCountByStatus = <T extends string>(
  items: Array<{ status: T }>,
  statuses: readonly T[],
) =>
  statuses.map((status) => ({
    status,
    count: items.filter((item) => item.status === status).length,
  }));

const orderStatusSummary = computed(() =>
  getCountByStatus<OrderStatus>(orders.value, [
    "pending",
    "approved",
    "rejected",
    "cancelled",
    "completed",
  ]),
);

const deliveryStatusSummary = computed(() =>
  getCountByStatus<DeliveryStatus>(deliveries.value, [
    "scheduled",
    "in_transit",
    "delivered",
    "failed",
    "cancelled",
  ]),
);

const paymentStatusSummary = computed(() =>
  getCountByStatus<PaymentStatus>(payments.value, [
    "pending",
    "paid",
    "failed",
    "refunded",
  ]),
);

const orderTrendBars = computed(() => {
  const groupedByDate = orders.value.reduce<Record<string, number>>(
    (grouped, order) => {
      const dateKey = formatShortDateOrFallback(order.created_at, "Unknown");
      grouped[dateKey] =
        (grouped[dateKey] ?? 0) + Number(order.total_amount ?? 0);
      return grouped;
    },
    {},
  );

  const rows = Object.entries(groupedByDate)
    .map(([label, total]) => ({ label, total }))
    .sort((a, b) => b.total - a.total)
    .slice(0, 6);

  const maxTotal = rows.reduce((max, row) => Math.max(max, row.total), 0);

  return rows.map((row) => ({
    ...row,
    widthClass: progressWidthClass(
      maxTotal > 0 ? Math.max((row.total / maxTotal) * 100, 6) : 0,
    ),
  }));
});

const dashboardActivity = computed<DashboardActivity[]>(() => {
  const orderEvents: DashboardActivity[] = orders.value
    .slice(0, 6)
    .map((order) => ({
      id: `order-${order.id}`,
      label: `Order ${order.id}`,
      detail: `Status: ${order.status}`,
      date: order.created_at,
      icon: "i-lucide-shopping-bag",
    }));

  const paymentEvents: DashboardActivity[] = payments.value
    .slice(0, 6)
    .map((payment) => ({
      id: `payment-${payment.id}`,
      label: `Payment ${payment.id}`,
      detail: `${payment.status} / ${formatCurrency(payment.amount ?? 0)}`,
      date: payment.created_at,
      icon: "i-lucide-credit-card",
    }));

  const customerEvents: DashboardActivity[] = customers.value
    .slice(0, 6)
    .map((customer) => ({
      id: `customer-${customer.id}`,
      label: customer.company_name,
      detail: `New customer profile`,
      date: customer.created_at,
      icon: "i-lucide-building-2",
    }));

  return [...orderEvents, ...paymentEvents, ...customerEvents]
    .sort(
      (left, right) =>
        new Date(right.date ?? 0).getTime() -
        new Date(left.date ?? 0).getTime(),
    )
    .slice(0, 10);
});

const handleRetry = async () => {
  isRetrying.value = true;
  await loadDashboard();
  isRetrying.value = false;
};
</script>

<template>
  <div class="min-h-screen space-y-6">
    <section class="rounded-sm bg-white p-6 shadow-sm dark:bg-gray-900 md:p-8">
      <div
        class="flex flex-col gap-4 md:flex-row md:items-end md:justify-between"
      >
        <div>
          <p
            class="text-xs font-medium uppercase tracking-[0.2em] text-amber-700"
          >
            Operations Dashboard
          </p>
          <h1
            class="mt-3 text-3xl font-semibold tracking-tight text-slate-900 md:text-4xl"
          >
            Zoom @ Wide performance overview
          </h1>
          <p class="mt-3 max-w-3xl text-sm leading-7 text-slate-600">
            Track active catalog items, incoming orders, delivery progress, and
            payment outcomes from one operational view.
          </p>
        </div>
        <div class="flex flex-wrap gap-2">
          <UButton
            color="neutral"
            variant="outline"
            class="rounded-lg font-semibold"
            to="/admin/orders"
          >
            View Orders
          </UButton>
          <UButton
            color="warning"
            class="rounded-lg font-semibold shadow-sm"
            to="/admin/products"
          >
            Manage Products
          </UButton>
        </div>
      </div>
    </section>

    <AdminPageStateCard
      v-if="pageError"
      eyebrow="Dashboard"
      title="Dashboard data unavailable"
      :description="pageError"
      tone="error"
      action-label="Retry"
      :action-loading="isRetrying"
      @action="handleRetry"
    />

    <template v-else>
      <section
        v-if="isLoading && !orders.length && !products.length"
        class="grid gap-4 sm:grid-cols-2 xl:grid-cols-4"
      >
        <USkeleton v-for="idx in 4" :key="idx" class="h-32 rounded-lg" />
      </section>

      <section v-else class="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <article
          v-for="card in kpiCards"
          :key="card.title"
          class="rounded-sm bg-white p-5 shadow-sm dark:bg-gray-900"
        >
          <div class="flex items-start justify-between gap-3">
            <div>
              <p class="text-xs uppercase tracking-[0.16em] text-slate-500">
                {{ card.title }}
              </p>
              <p
                class="mt-2 text-2xl font-semibold tracking-tight text-slate-900"
              >
                {{ card.value }}
              </p>
              <p class="mt-2 text-sm text-slate-600">
                {{ card.description }}
              </p>
            </div>
            <div
              class="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-900 text-white"
            >
              <UIcon :name="card.icon" />
            </div>
          </div>
        </article>
      </section>

      <section class="">
        <div class="space-y-4">
          <article class="rounded-sm bg-white p-5 shadow-sm dark:bg-gray-900">
            <div class="flex items-center justify-between gap-3">
              <h2 class="text-xl font-semibold tracking-tight text-slate-900">
                Top Order Value Days
              </h2>
              <UBadge color="neutral" variant="subtle">
                Last {{ orderTrendBars.length }} snapshots
              </UBadge>
            </div>

            <div v-if="orderTrendBars.length" class="mt-5 space-y-3">
              <div
                v-for="row in orderTrendBars"
                :key="row.label"
                class="space-y-2"
              >
                <div
                  class="flex items-center justify-between text-sm text-slate-600"
                >
                  <span>{{ row.label }}</span>
                  <span class="font-semibold text-slate-900">{{
                    formatCurrency(row.total)
                  }}</span>
                </div>
                <div class="h-2 rounded-full bg-slate-100">
                  <div
                    :class="[
                      'h-full rounded-full bg-amber-500',
                      row.widthClass,
                    ]"
                  />
                </div>
              </div>
            </div>
            <p v-else class="mt-5 text-sm text-slate-600">
              Order totals will appear here once transaction records are
              available.
            </p>
          </article>

          <div class="grid gap-4 md:grid-cols-3">
            <article class="rounded-sm bg-white p-5 shadow-sm dark:bg-gray-900">
              <p class="text-xs uppercase tracking-[0.16em] text-slate-500">
                Order Status
              </p>
              <div class="mt-3 space-y-2">
                <div
                  v-for="row in orderStatusSummary"
                  :key="`order-${row.status}`"
                  class="flex items-center justify-between text-sm"
                >
                  <span class="capitalize text-slate-600">{{
                    row.status.replace("_", " ")
                  }}</span>
                  <span class="font-semibold text-slate-900">{{
                    row.count
                  }}</span>
                </div>
              </div>
            </article>

            <article class="rounded-sm bg-white p-5 shadow-sm dark:bg-gray-900">
              <p class="text-xs uppercase tracking-[0.16em] text-slate-500">
                Delivery Status
              </p>
              <div class="mt-3 space-y-2">
                <div
                  v-for="row in deliveryStatusSummary"
                  :key="`delivery-${row.status}`"
                  class="flex items-center justify-between text-sm"
                >
                  <span class="capitalize text-slate-600">{{
                    row.status.replace("_", " ")
                  }}</span>
                  <span class="font-semibold text-slate-900">{{
                    row.count
                  }}</span>
                </div>
              </div>
            </article>

            <article class="rounded-sm bg-white p-5 shadow-sm dark:bg-gray-900">
              <p class="text-xs uppercase tracking-[0.16em] text-slate-500">
                Payment Status
              </p>
              <div class="mt-3 space-y-2">
                <div
                  v-for="row in paymentStatusSummary"
                  :key="`payment-${row.status}`"
                  class="flex items-center justify-between text-sm"
                >
                  <span class="capitalize text-slate-600">{{
                    row.status.replace("_", " ")
                  }}</span>
                  <span class="font-semibold text-slate-900">{{
                    row.count
                  }}</span>
                </div>
              </div>
            </article>
          </div>
        </div>

        <!-- <aside class="rounded-sm bg-white p-5 shadow-sm dark:bg-gray-900">
          <div class="flex items-center justify-between gap-3">
            <h2 class="text-xl font-semibold tracking-tight text-slate-900">
              Activity Feed
            </h2>
            <UBadge color="warning" variant="subtle">
              Live context
            </UBadge>
          </div>

          <div v-if="dashboardActivity.length" class="mt-5 space-y-3">
            <article
              v-for="entry in dashboardActivity"
              :key="entry.id"
              class="flex items-start gap-3 rounded-sm bg-white p-3 dark:bg-gray-900"
            >
              <div class="mt-0.5 flex h-8 w-8 items-center justify-center rounded-lg bg-slate-900 text-white">
                <UIcon :name="entry.icon" />
              </div>
              <div class="min-w-0">
                <p class="font-medium text-slate-900">
                  {{ entry.label }}
                </p>
                <p class="text-sm text-slate-600">
                  {{ entry.detail }}
                </p>
                <p class="mt-1 text-xs text-slate-500">
                  {{ formatShortDateOrFallback(entry.date) }}
                </p>
              </div>
            </article>
          </div>
          <p v-else class="mt-5 text-sm text-slate-600">
            Recent activity will appear here as orders, payments, and customers are updated.
          </p>
        </aside> -->
      </section>
    </template>
  </div>
</template>
