<script setup lang="ts">
import { storeToRefs } from "pinia";
import type { Delivery, DeliveryStatus } from "~/types/delivery";
import type { InventoryMovementType } from "~/types/inventory";
import type { Order, OrderStatus } from "~/types/order";
import type { Payment, PaymentStatus } from "~/types/payment";
import AdminPageHeader from "../../_components/AdminPageHeader.vue";
import AdminPageStateCard from "../../_components/AdminPageStateCard.vue";
import { useAdminPageLoadState } from "~/composables/admin/useAdminPageLoadState";
import {
  formatCurrency,
  formatNumber,
  formatShortDateOrFallback,
} from "~/utils/format";
import { buildInventoryBalanceMap } from "~/utils/inventory-balance";
import ReportMetricCard from "./ReportMetricCard.vue";
import ReportsFilters from "./ReportsFilters.vue";

type ReportStatusRow = {
  label: string;
  count: number;
  amount?: number;
};

type CustomerReportRow = {
  id: string;
  name: string;
  contact: string;
  orders: number;
  revenue: number;
};

const reportLimit = 100;

const dashboardStore = useDashboardStore();
const orderStore = useOrderStore();
const paymentStore = usePaymentStore();
const deliveryStore = useDeliveryStore();
const customerStore = useCustomerStore();
const productStore = useProductStore();
const inventoryStore = useInventoryStore();
const { getLoadErrorMessage } = useAdminPageLoadState();

const pageError = ref<string | null>(null);
const isRetrying = ref(false);
const fromDate = ref("");
const toDate = ref("");
const orderStatus = ref("all");
const paymentStatus = ref("all");
const deliveryStatus = ref("all");
const stockStatus = ref("all");

const { isLoading: isDashboardLoading } = storeToRefs(dashboardStore);
const { orders, totalOrders, isLoading: isOrdersLoading } =
  storeToRefs(orderStore);
const { payments, totalPayments, isLoading: isPaymentsLoading } =
  storeToRefs(paymentStore);
const { deliveries, totalDeliveries, isLoading: isDeliveriesLoading } =
  storeToRefs(deliveryStore);
const { customers, totalCustomers, isLoading: isCustomersLoading } =
  storeToRefs(customerStore);
const { products, totalProducts, isLoading: isProductsLoading } =
  storeToRefs(productStore);
const { logs, totalLogs, isLoading: isInventoryLoading } =
  storeToRefs(inventoryStore);

const orderStatusOptions = [
  { label: "All order status", value: "all" },
  { label: "Pending", value: "pending" },
  { label: "Approved", value: "approved" },
  { label: "Rejected", value: "rejected" },
  { label: "Cancelled", value: "cancelled" },
  { label: "Completed", value: "completed" },
];

const paymentStatusOptions = [
  { label: "All payment status", value: "all" },
  { label: "Pending", value: "pending" },
  { label: "Paid", value: "paid" },
  { label: "Failed", value: "failed" },
  { label: "Refunded", value: "refunded" },
];

const deliveryStatusOptions = [
  { label: "All delivery status", value: "all" },
  { label: "Scheduled", value: "scheduled" },
  { label: "In transit", value: "in_transit" },
  { label: "Delivered", value: "delivered" },
  { label: "Failed", value: "failed" },
  { label: "Cancelled", value: "cancelled" },
];

const stockStatusOptions = [
  { label: "All stock levels", value: "all" },
  { label: "Healthy stock", value: "healthy" },
  { label: "Low stock", value: "low" },
  { label: "Out of stock", value: "out" },
];

const isPageLoading = computed(
  () =>
    isDashboardLoading.value ||
    isOrdersLoading.value ||
    isPaymentsLoading.value ||
    isDeliveriesLoading.value ||
    isCustomersLoading.value ||
    isProductsLoading.value ||
    isInventoryLoading.value,
);

const loadReports = async () => {
  const responses = await Promise.all([
    dashboardStore.fetchDashboardData(),
    orderStore.fetchOrders({
      q: "",
      status: "",
      page: 1,
      limit: reportLimit,
    }),
    paymentStore.fetchPayments({
      q: "",
      status: "",
      method: "",
      order_id: undefined,
      page: 1,
      limit: reportLimit,
    }),
    deliveryStore.fetchDeliveries({
      q: "",
      status: "",
      page: 1,
      limit: reportLimit,
    }),
    customerStore.fetchCustomers({
      q: "",
      page: 1,
      limit: reportLimit,
    }),
    productStore.fetchProducts({
      q: "",
      page: 1,
      limit: reportLimit,
    }),
    inventoryStore.fetchInventoryLogs({
      q: "",
      page: 1,
      limit: reportLimit,
    }),
  ]);

  pageError.value = responses.every((response) => response.status === "error")
    ? getLoadErrorMessage(
        responses,
        "The admin reports could not be loaded right now.",
      )
    : null;
};

await loadReports();

const toDateValue = (value?: string | null) => {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
};

const isWithinDateRange = (value?: string | null) => {
  const date = toDateValue(value);
  if (!date) return true;

  if (fromDate.value) {
    const start = new Date(`${fromDate.value}T00:00:00`);
    if (date < start) return false;
  }

  if (toDate.value) {
    const end = new Date(`${toDate.value}T23:59:59`);
    if (date > end) return false;
  }

  return true;
};

const labelStatus = (value: string) =>
  value
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");

const filteredOrders = computed(() =>
  orders.value.filter((order) => {
    const matchesDate = isWithinDateRange(order.created_at);
    const matchesStatus =
      orderStatus.value === "all" || order.status === orderStatus.value;
    return matchesDate && matchesStatus;
  }),
);

const filteredPayments = computed(() =>
  payments.value.filter((payment) => {
    const matchesDate = isWithinDateRange(payment.paid_at ?? payment.created_at);
    const matchesStatus =
      paymentStatus.value === "all" || payment.status === paymentStatus.value;
    return matchesDate && matchesStatus;
  }),
);

const filteredDeliveries = computed(() =>
  deliveries.value.filter((delivery) => {
    const matchesDate = isWithinDateRange(
      delivery.scheduled_at ?? delivery.delivered_at ?? delivery.created_at,
    );
    const matchesStatus =
      deliveryStatus.value === "all" ||
      delivery.status === deliveryStatus.value;
    return matchesDate && matchesStatus;
  }),
);

const filteredMovements = computed(() =>
  logs.value.filter((entry) => isWithinDateRange(entry.created_at)),
);

const stockMap = computed(() =>
  buildInventoryBalanceMap(logs.value, products.value),
);

const stockState = (productId?: string, minimum = 0) => {
  const current = stockMap.value[productId ?? ""] ?? 0;
  if (current === 0) return "out";
  if (current <= minimum) return "low";
  return "healthy";
};

const filteredProducts = computed(() =>
  products.value.filter((product) => {
    if (stockStatus.value === "all") return true;
    return (
      stockState(product.id, product.minimum_stock_quantity ?? 0) ===
      stockStatus.value
    );
  }),
);

const lowStockProducts = computed(() =>
  products.value
    .map((product) => ({
      product,
      currentStock: stockMap.value[product.id ?? ""] ?? 0,
      minimumStock: product.minimum_stock_quantity ?? 0,
      state: stockState(product.id, product.minimum_stock_quantity ?? 0),
    }))
    .filter((entry) => entry.state === "low" || entry.state === "out")
    .slice(0, 8),
);

const sumOrders = (items: Order[]) =>
  items.reduce((total, order) => total + Number(order.total_amount ?? 0), 0);

const sumPayments = (items: Payment[]) =>
  items.reduce((total, payment) => total + Number(payment.amount ?? 0), 0);

const salesAmount = computed(() => sumOrders(filteredOrders.value));
const paidAmount = computed(() =>
  sumPayments(filteredPayments.value.filter((payment) => payment.status === "paid")),
);

const countByStatus = <T extends string>(
  rows: Array<{ status: T }>,
  statuses: readonly T[],
) =>
  statuses.map((status) => ({
    label: labelStatus(status),
    count: rows.filter((row) => row.status === status).length,
  }));

const orderStatusRows = computed<ReportStatusRow[]>(() =>
  ([
    "pending",
    "approved",
    "rejected",
    "cancelled",
    "completed",
  ] as OrderStatus[]).map((status) => ({
    label: labelStatus(status),
    count: filteredOrders.value.filter((order) => order.status === status).length,
    amount: sumOrders(
      filteredOrders.value.filter((order) => order.status === status),
    ),
  })),
);

const paymentStatusRows = computed<ReportStatusRow[]>(() =>
  (["pending", "paid", "failed", "refunded"] as PaymentStatus[]).map(
    (status) => ({
      label: labelStatus(status),
      count: filteredPayments.value.filter((payment) => payment.status === status)
        .length,
      amount: sumPayments(
        filteredPayments.value.filter((payment) => payment.status === status),
      ),
    }),
  ),
);

const paymentMethodRows = computed<ReportStatusRow[]>(() => {
  const methods = ["cash", "card", "bank_transfer", "mobile_wallet"];
  return methods.map((method) => {
    const rows = filteredPayments.value.filter((payment) => payment.method === method);
    return {
      label: labelStatus(method),
      count: rows.length,
      amount: sumPayments(rows),
    };
  });
});

const deliveryStatusRows = computed<ReportStatusRow[]>(() =>
  countByStatus(
    filteredDeliveries.value,
    ["scheduled", "in_transit", "delivered", "failed", "cancelled"] as DeliveryStatus[],
  ),
);

const movementRows = computed<ReportStatusRow[]>(() =>
  (["in", "out", "adjustment"] as InventoryMovementType[]).map((type) => {
    const rows = filteredMovements.value.filter(
      (entry) => entry.movement_type === type,
    );
    return {
      label: labelStatus(type),
      count: rows.length,
      amount: rows.reduce(
        (total, entry) => total + Math.abs(Number(entry.quantity_change ?? 0)),
        0,
      ),
    };
  }),
);

const customerMap = computed(
  () => new Map(customers.value.map((customer) => [customer.id, customer])),
);

const customerReportRows = computed<CustomerReportRow[]>(() => {
  const rows = new Map<string, CustomerReportRow>();

  for (const order of filteredOrders.value) {
    const customer = customerMap.value.get(order.customer_id);
    const existing = rows.get(order.customer_id) ?? {
      id: order.customer_id,
      name:
        customer?.company_name ??
        customer?.contact_name ??
        "Customer record unavailable",
      contact: customer?.email ?? customer?.phone ?? "Contact unavailable",
      orders: 0,
      revenue: 0,
    };

    existing.orders += 1;
    existing.revenue += Number(order.total_amount ?? 0);
    rows.set(order.customer_id, existing);
  }

  return Array.from(rows.values())
    .sort((first, second) => second.revenue - first.revenue)
    .slice(0, 8);
});

const dateRangeLabel = computed(() => {
  if (fromDate.value && toDate.value) return `${fromDate.value} to ${toDate.value}`;
  if (fromDate.value) return `From ${fromDate.value}`;
  if (toDate.value) return `Until ${toDate.value}`;
  return "All available records";
});

const summaryCards = computed(() => [
  {
    label: "Sales",
    value: formatCurrency(salesAmount.value),
    description: `${formatNumber(filteredOrders.value.length)} filtered orders`,
  },
  {
    label: "Payments",
    value: formatCurrency(paidAmount.value),
    description: `${formatNumber(filteredPayments.value.length)} payment records`,
  },
  {
    label: "Inventory",
    value: formatNumber(filteredProducts.value.length),
    description: `${formatNumber(lowStockProducts.value.length)} low or out of stock`,
  },
  {
    label: "Deliveries",
    value: formatNumber(filteredDeliveries.value.length),
    description: `${formatNumber(totalDeliveries.value)} total delivery records`,
  },
]);

const escapeCsv = (value: string | number) => {
  const text = String(value);
  return /[",\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
};

const buildCsvRows = () => {
  const rows: Array<Array<string | number>> = [
    ["Admin Reports"],
    ["Date range", dateRangeLabel.value],
    [],
    ["Sales Report"],
    ["Metric", "Value"],
    ["Orders", filteredOrders.value.length],
    ["Gross sales", salesAmount.value],
    ...orderStatusRows.value.map((row) => [
      row.label,
      row.count,
      row.amount ?? 0,
    ]),
    [],
    ["Payment Report"],
    ["Status", "Count", "Amount"],
    ...paymentStatusRows.value.map((row) => [
      row.label,
      row.count,
      row.amount ?? 0,
    ]),
    [],
    ["Inventory Report"],
    ["Movement", "Records", "Quantity"],
    ...movementRows.value.map((row) => [row.label, row.count, row.amount ?? 0]),
    [],
    ["Low Stock Report"],
    ["Product", "SKU", "Current", "Minimum", "Status"],
    ...lowStockProducts.value.map((row) => [
      row.product.name ?? "Unnamed product",
      row.product.sku ?? "",
      row.currentStock,
      row.minimumStock,
      labelStatus(row.state),
    ]),
    [],
    ["Delivery Performance Report"],
    ["Status", "Count"],
    ...deliveryStatusRows.value.map((row) => [row.label, row.count]),
    [],
    ["Customer Order History"],
    ["Customer", "Contact", "Orders", "Revenue"],
    ...customerReportRows.value.map((row) => [
      row.name,
      row.contact,
      row.orders,
      row.revenue,
    ]),
  ];

  return rows.map((row) => row.map(escapeCsv).join(",")).join("\n");
};

const downloadCsv = () => {
  const blob = new Blob([buildCsvRows()], {
    type: "text/csv;charset=utf-8",
  });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = "admin-reports.csv";
  anchor.click();
  URL.revokeObjectURL(url);
};

const handleRetry = async () => {
  isRetrying.value = true;
  await loadReports();
  isRetrying.value = false;
};
</script>

<template>
  <div class="min-h-screen">
    <div class="space-y-6">
      <AdminPageHeader
        eyebrow="Reports"
        title="Admin Reports"
        description="Review sales, payments, inventory, deliveries, and customer order activity from the current admin data."
        :total="totalOrders + totalPayments + totalLogs + totalProducts + totalCustomers"
        total-label="records"
      />

      <AdminPageStateCard
        v-if="pageError"
        eyebrow="Reports"
        title="Reports unavailable"
        :description="pageError"
        tone="error"
        action-label="Retry"
        :action-loading="isRetrying"
        @action="handleRetry"
      />

      <template v-else>
        <ReportsFilters
          v-model:from-date="fromDate"
          v-model:to-date="toDate"
          v-model:order-status="orderStatus"
          v-model:payment-status="paymentStatus"
          v-model:delivery-status="deliveryStatus"
          v-model:stock-status="stockStatus"
          :order-status-options="orderStatusOptions"
          :payment-status-options="paymentStatusOptions"
          :delivery-status-options="deliveryStatusOptions"
          :stock-status-options="stockStatusOptions"
          :is-loading="isPageLoading"
          @refresh="handleRetry"
          @export="downloadCsv"
        />

        <div class="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <ReportMetricCard
            v-for="card in summaryCards"
            :key="card.label"
            :label="card.label"
            :value="card.value"
            :description="card.description"
          />
        </div>

        <section class="space-y-4">
          <div>
            <p class="text-xs uppercase tracking-[0.18em] text-slate-500">
              Sales report
            </p>
            <h2 class="mt-1 text-xl font-semibold text-slate-900">
              Orders by status
            </h2>
          </div>
          <UCard>
            <div class="grid gap-3 md:grid-cols-2 xl:grid-cols-5">
              <div
                v-for="row in orderStatusRows"
                :key="row.label"
                class="rounded-sm border border-default p-4"
              >
                <p class="text-sm font-medium text-slate-900">
                  {{ row.label }}
                </p>
                <p class="mt-2 text-2xl font-semibold">
                  {{ formatNumber(row.count) }}
                </p>
                <p class="mt-1 text-sm text-slate-600">
                  {{ formatCurrency(row.amount ?? 0) }}
                </p>
              </div>
            </div>
          </UCard>
        </section>

        <section class="space-y-4">
          <div>
            <p class="text-xs uppercase tracking-[0.18em] text-slate-500">
              Payment report
            </p>
            <h2 class="mt-1 text-xl font-semibold text-slate-900">
              Payment outcomes and methods
            </h2>
          </div>
          <div class="grid gap-4 lg:grid-cols-2">
            <UCard>
              <div class="space-y-3">
                <div
                  v-for="row in paymentStatusRows"
                  :key="row.label"
                  class="flex items-center justify-between gap-4 border-b border-default pb-3 last:border-b-0 last:pb-0"
                >
                  <div>
                    <p class="font-medium text-slate-900">{{ row.label }}</p>
                    <p class="text-sm text-slate-500">
                      {{ formatNumber(row.count) }} records
                    </p>
                  </div>
                  <p class="font-semibold">{{ formatCurrency(row.amount ?? 0) }}</p>
                </div>
              </div>
            </UCard>
            <UCard>
              <div class="space-y-3">
                <div
                  v-for="row in paymentMethodRows"
                  :key="row.label"
                  class="flex items-center justify-between gap-4 border-b border-default pb-3 last:border-b-0 last:pb-0"
                >
                  <div>
                    <p class="font-medium text-slate-900">{{ row.label }}</p>
                    <p class="text-sm text-slate-500">
                      {{ formatNumber(row.count) }} records
                    </p>
                  </div>
                  <p class="font-semibold">{{ formatCurrency(row.amount ?? 0) }}</p>
                </div>
              </div>
            </UCard>
          </div>
        </section>

        <section class="space-y-4">
          <div>
            <p class="text-xs uppercase tracking-[0.18em] text-slate-500">
              Inventory report
            </p>
            <h2 class="mt-1 text-xl font-semibold text-slate-900">
              Stock movement summary
            </h2>
          </div>
          <UCard>
            <div class="grid gap-3 md:grid-cols-3">
              <div
                v-for="row in movementRows"
                :key="row.label"
                class="rounded-sm border border-default p-4"
              >
                <p class="text-sm font-medium text-slate-900">
                  {{ row.label }}
                </p>
                <p class="mt-2 text-2xl font-semibold">
                  {{ formatNumber(row.count) }}
                </p>
                <p class="mt-1 text-sm text-slate-600">
                  {{ formatNumber(row.amount ?? 0) }} units
                </p>
              </div>
            </div>
          </UCard>
        </section>

        <section class="space-y-4">
          <div>
            <p class="text-xs uppercase tracking-[0.18em] text-slate-500">
              Low-stock report
            </p>
            <h2 class="mt-1 text-xl font-semibold text-slate-900">
              Products needing attention
            </h2>
          </div>
          <UCard>
            <div v-if="lowStockProducts.length" class="space-y-3">
              <div
                v-for="row in lowStockProducts"
                :key="row.product.id"
                class="flex flex-col gap-3 border-b border-default pb-3 last:border-b-0 last:pb-0 md:flex-row md:items-center md:justify-between"
              >
                <div>
                  <p class="font-medium text-slate-900">
                    {{ row.product.name ?? "Unnamed product" }}
                  </p>
                  <p class="text-sm text-slate-500">
                    {{ row.product.sku ?? "No SKU" }}
                  </p>
                </div>
                <div class="flex flex-wrap items-center gap-2">
                  <UBadge :color="row.state === 'out' ? 'error' : 'warning'" variant="subtle">
                    {{ labelStatus(row.state) }}
                  </UBadge>
                  <span class="text-sm text-slate-600">
                    {{ formatNumber(row.currentStock) }} on hand / min
                    {{ formatNumber(row.minimumStock) }}
                  </span>
                </div>
              </div>
            </div>
            <p v-else class="text-sm text-slate-600">
              No low-stock products match the current filters.
            </p>
          </UCard>
        </section>

        <section class="space-y-4">
          <div>
            <p class="text-xs uppercase tracking-[0.18em] text-slate-500">
              Delivery performance report
            </p>
            <h2 class="mt-1 text-xl font-semibold text-slate-900">
              Fulfillment status mix
            </h2>
          </div>
          <UCard>
            <div class="grid gap-3 md:grid-cols-2 xl:grid-cols-5">
              <div
                v-for="row in deliveryStatusRows"
                :key="row.label"
                class="rounded-sm border border-default p-4"
              >
                <p class="text-sm font-medium text-slate-900">
                  {{ row.label }}
                </p>
                <p class="mt-2 text-2xl font-semibold">
                  {{ formatNumber(row.count) }}
                </p>
              </div>
            </div>
          </UCard>
        </section>

        <section class="space-y-4">
          <div>
            <p class="text-xs uppercase tracking-[0.18em] text-slate-500">
              Customer order history
            </p>
            <h2 class="mt-1 text-xl font-semibold text-slate-900">
              Top customer activity
            </h2>
          </div>
          <UCard>
            <div v-if="customerReportRows.length" class="space-y-3">
              <div
                v-for="row in customerReportRows"
                :key="row.id"
                class="grid gap-3 border-b border-default pb-3 last:border-b-0 last:pb-0 md:grid-cols-[1fr_auto_auto]"
              >
                <div>
                  <p class="font-medium text-slate-900">{{ row.name }}</p>
                  <p class="text-sm text-slate-500">{{ row.contact }}</p>
                </div>
                <p class="text-sm text-slate-600">
                  {{ formatNumber(row.orders) }} orders
                </p>
                <p class="font-semibold">
                  {{ formatCurrency(row.revenue) }}
                </p>
              </div>
            </div>
            <p v-else class="text-sm text-slate-600">
              Customer order history will appear once orders match the current filters.
            </p>
          </UCard>
        </section>
      </template>
    </div>
  </div>
</template>
