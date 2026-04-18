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
  buildAdminReportsCsv,
  type AdminCustomerReportRow,
  type AdminLowStockReportRow,
  type AdminReportStatusRow,
} from "~/utils/admin-reports";
import {
  formatCurrency,
  formatNumber,
  formatStatusLabel,
} from "~/utils/format";
import { buildInventoryBalanceMap } from "~/utils/inventory-balance";
import CustomerReportCard from "./CustomerReportCard.vue";
import LowStockReportCard from "./LowStockReportCard.vue";
import ReportAmountList from "./ReportAmountList.vue";
import ReportMetricCard from "./ReportMetricCard.vue";
import ReportSection from "./ReportSection.vue";
import ReportStatusGrid from "./ReportStatusGrid.vue";
import ReportsFilters from "./ReportsFilters.vue";

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

const lowStockProducts = computed<AdminLowStockReportRow[]>(() =>
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
    label: formatStatusLabel(status),
    count: rows.filter((row) => row.status === status).length,
  }));

const orderStatusRows = computed<AdminReportStatusRow[]>(() =>
  ([
    "pending",
    "approved",
    "rejected",
    "cancelled",
    "completed",
  ] as OrderStatus[]).map((status) => ({
    label: formatStatusLabel(status),
    count: filteredOrders.value.filter((order) => order.status === status).length,
    amount: sumOrders(
      filteredOrders.value.filter((order) => order.status === status),
    ),
  })),
);

const paymentStatusRows = computed<AdminReportStatusRow[]>(() =>
  (["pending", "paid", "failed", "refunded"] as PaymentStatus[]).map(
    (status) => ({
      label: formatStatusLabel(status),
      count: filteredPayments.value.filter((payment) => payment.status === status)
        .length,
      amount: sumPayments(
        filteredPayments.value.filter((payment) => payment.status === status),
      ),
    }),
  ),
);

const paymentMethodRows = computed<AdminReportStatusRow[]>(() => {
  const methods = ["cash", "card", "bank_transfer", "mobile_wallet"];
  return methods.map((method) => {
    const rows = filteredPayments.value.filter((payment) => payment.method === method);
    return {
      label: formatStatusLabel(method),
      count: rows.length,
      amount: sumPayments(rows),
    };
  });
});

const deliveryStatusRows = computed<AdminReportStatusRow[]>(() =>
  countByStatus(
    filteredDeliveries.value,
    ["scheduled", "in_transit", "delivered", "failed", "cancelled"] as DeliveryStatus[],
  ),
);

const movementRows = computed<AdminReportStatusRow[]>(() =>
  (["in", "out", "adjustment"] as InventoryMovementType[]).map((type) => {
    const rows = filteredMovements.value.filter(
      (entry) => entry.movement_type === type,
    );
    return {
      label: formatStatusLabel(type),
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

const customerReportRows = computed<AdminCustomerReportRow[]>(() => {
  const rows = new Map<string, AdminCustomerReportRow>();

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

const buildCsvRows = () => {
  return buildAdminReportsCsv({
    dateRangeLabel: dateRangeLabel.value,
    ordersCount: filteredOrders.value.length,
    grossSales: salesAmount.value,
    orderStatusRows: orderStatusRows.value,
    paymentStatusRows: paymentStatusRows.value,
    movementRows: movementRows.value,
    lowStockProducts: lowStockProducts.value,
    deliveryStatusRows: deliveryStatusRows.value,
    customerReportRows: customerReportRows.value,
  });
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

        <ReportSection eyebrow="Sales report" title="Orders by status">
          <ReportStatusGrid :rows="orderStatusRows" amount-format="currency" />
        </ReportSection>

        <ReportSection
          eyebrow="Payment report"
          title="Payment outcomes and methods"
        >
          <div class="grid gap-4 lg:grid-cols-2">
            <ReportAmountList :rows="paymentStatusRows" />
            <ReportAmountList :rows="paymentMethodRows" />
          </div>
        </ReportSection>

        <ReportSection eyebrow="Inventory report" title="Stock movement summary">
          <ReportStatusGrid
            :rows="movementRows"
            columns-class="md:grid-cols-3"
            amount-format="number"
            amount-suffix="units"
          />
        </ReportSection>

        <ReportSection eyebrow="Low-stock report" title="Products needing attention">
          <LowStockReportCard :rows="lowStockProducts" />
        </ReportSection>

        <ReportSection
          eyebrow="Delivery performance report"
          title="Fulfillment status mix"
        >
          <ReportStatusGrid :rows="deliveryStatusRows" />
        </ReportSection>

        <ReportSection
          eyebrow="Customer order history"
          title="Top customer activity"
        >
          <CustomerReportCard :rows="customerReportRows" />
        </ReportSection>
      </template>
    </div>
  </div>
</template>
