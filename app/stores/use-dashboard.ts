import { ref } from "vue";
import { defineStore } from "pinia";
import type { DeliveryStatus } from "~/types/delivery";
import type {
  DashboardActivity,
  DashboardInventorySummary,
  DashboardMetricSummary,
  DashboardPaymentSummary,
  DashboardProductInsights,
  DashboardResponse,
  DashboardStatusSummary,
  DashboardTopProductRow,
} from "~/types/dashboard";
import type { OrderStatus } from "~/types/order";
import type { PaymentStatus } from "~/types/payment";
import type { StoreResponse } from "~/types/store-response";
import { apiRequest, toErrorMessage } from "~/utils/api";

type SummaryStatus = OrderStatus | DeliveryStatus | PaymentStatus | string;

const isRecord = (value: unknown): value is Record<string, unknown> =>
  Boolean(value) && typeof value === "object" && !Array.isArray(value);

const asArray = (value: unknown): unknown[] => {
  if (Array.isArray(value)) return value;
  if (!isRecord(value)) return [];

  for (const key of ["items", "data", "rows", "activity", "activities"]) {
    const entry = value[key];
    if (Array.isArray(entry)) return entry;
  }

  return [];
};

const toNumber = (value: unknown, fallback = 0) => {
  const numeric = Number(value);
  return Number.isFinite(numeric) ? numeric : fallback;
};

const toText = (value: unknown, fallback = "") => {
  if (typeof value !== "string") return fallback;
  const text = value.trim();
  return text ? text : fallback;
};

const pickNumber = (value: unknown, keys: string[], fallback = 0) => {
  if (!isRecord(value)) return fallback;

  for (const key of keys) {
    if (key in value) {
      return toNumber(value[key], fallback);
    }
  }

  return fallback;
};

const normalizeStatusCounts = <TStatus extends SummaryStatus>(
  value: unknown,
  statuses: readonly TStatus[],
  fallback: DashboardStatusSummary<TStatus>[] = [],
) => {
  const source = isRecord(value)
    ? value.by_status ?? value.statuses ?? value.status_counts ?? value.counts
    : value;

  if (Array.isArray(source)) {
    const rows = source
      .flatMap((entry) => {
        if (!isRecord(entry)) return [];
        const status = toText(entry.status);
        if (!status) return [];
        return [
          {
            status: status as TStatus,
            count: toNumber(entry.count ?? entry.total),
          },
        ];
      })
      .filter((entry) => statuses.includes(entry.status));

    return statuses.map((status) => ({
      status,
      count: rows.find((entry) => entry.status === status)?.count ?? 0,
    }));
  }

  if (isRecord(source)) {
    return statuses.map((status) => ({
      status,
      count: toNumber(source[status]),
    }));
  }

  if (fallback.length) {
    return statuses.map((status) => ({
      status,
      count: fallback.find((entry) => entry.status === status)?.count ?? 0,
    }));
  }

  return statuses.map((status) => ({ status, count: 0 }));
};

const normalizeRevenueSeries = (value: unknown) => {
  const source = isRecord(value)
    ? value.revenue_series ?? value.series ?? value.by_date ?? value.daily
    : value;

  return asArray(source)
    .flatMap((entry) => {
      if (!isRecord(entry)) return [];
      const date = toText(entry.date ?? entry.label);
      if (!date) return [];
      return [
        {
          date,
          revenue: toNumber(entry.revenue ?? entry.total ?? entry.amount),
        },
      ];
    })
    .slice(0, 8);
};

const normalizeTopProducts = (value: unknown): DashboardTopProductRow[] => {
  const source = isRecord(value)
    ? value.top_products ?? value.products ?? value.items ?? value.data
    : value;

  return asArray(source)
    .flatMap((entry) => {
      if (!isRecord(entry)) return [];
      const product = isRecord(entry.product)
        ? entry.product
        : {
            id: toText(entry.product_id ?? entry.id),
            name: toText(entry.name ?? entry.product_name, "Unnamed product"),
            sku: toText(entry.sku),
          };

      return [
        {
          product,
          units_sold: toNumber(entry.units_sold ?? entry.quantity ?? entry.units),
          revenue: toNumber(entry.revenue ?? entry.total ?? entry.amount),
        } as DashboardTopProductRow,
      ];
    })
    .slice(0, 6);
};

const normalizeActivity = (value: unknown): DashboardActivity[] =>
  asArray(value)
    .flatMap((entry, index) => {
      if (!isRecord(entry)) return [];

      const type = toText(entry.type ?? entry.kind);
      const label =
        toText(entry.label) ||
        toText(entry.title) ||
        toText(entry.message, "Activity update");
      const detail =
        toText(entry.detail) ||
        toText(entry.description) ||
        toText(entry.status) ||
        "Operational activity recorded";
      const date =
        toText(entry.date) ||
        toText(entry.created_at) ||
        toText(entry.updated_at) ||
        null;

      const icon =
        toText(entry.icon) ||
        (type.includes("payment")
          ? "i-lucide-credit-card"
          : type.includes("customer")
            ? "i-lucide-building-2"
            : type.includes("delivery")
              ? "i-lucide-truck"
              : "i-lucide-activity");

      return [
        {
          id: toText(entry.id, `activity-${index}`),
          label,
          detail,
          date,
          icon,
        },
      ];
    })
    .slice(0, 10);

export const useDashboardStore = defineStore("dashboard", () => {
  const summary = ref<DashboardResponse | null>(null);
  const recentActivity = ref<DashboardActivity[]>([]);
  const orderSummary = ref<DashboardMetricSummary>({
    total: 0,
    by_status: [],
    revenue_series: [],
  });
  const deliverySummary = ref<DashboardMetricSummary>({
    total: 0,
    by_status: [],
    revenue_series: [],
  });
  const paymentSummary = ref<DashboardPaymentSummary>({
    total: 0,
    by_status: [],
    revenue_series: [],
    paid_total: 0,
  });
  const inventorySummary = ref<DashboardInventorySummary>({
    total: 0,
    low_stock_count: 0,
    low_stock_items: [],
  });
  const productInsights = ref<DashboardProductInsights>({
    top_products: [],
  });
  const isLoading = ref(false);

  const fetchDashboardData = async (): Promise<StoreResponse> => {
    isLoading.value = true;

    const requests = await Promise.allSettled([
      apiRequest<DashboardResponse>("/dashboard/summary"),
      apiRequest<unknown>("/dashboard/recent-activity", {
        query: { limit: 10 },
      }),
      apiRequest<unknown>("/orders/summary"),
      apiRequest<unknown>("/deliveries/summary"),
      apiRequest<unknown>("/payments/summary"),
      apiRequest<unknown>("/inventory/summary"),
      apiRequest<unknown>("/products/insights", {
        query: { limit: 6 },
      }),
    ]);

    const [
      dashboardResult,
      activityResult,
      ordersResult,
      deliveriesResult,
      paymentsResult,
      inventoryResult,
      productsResult,
    ] = requests;

    if (dashboardResult.status === "fulfilled") {
      summary.value = dashboardResult.value.data ?? null;
    }

    if (activityResult.status === "fulfilled") {
      recentActivity.value = normalizeActivity(activityResult.value.data);
    }

    const dashboardDeliveryStatuses =
      summary.value?.delivery_statuses?.map((entry) => ({
        status: entry.status,
        count: entry.count,
      })) ?? [];

    if (ordersResult.status === "fulfilled") {
      const data = ordersResult.value.data;
      orderSummary.value = {
        total: pickNumber(data, ["total", "total_orders", "orders_total", "count"]),
        by_status: normalizeStatusCounts<OrderStatus>(data, [
          "pending",
          "approved",
          "rejected",
          "cancelled",
          "completed",
        ]),
        revenue_series: normalizeRevenueSeries(data),
      };
    }

    if (deliveriesResult.status === "fulfilled") {
      const data = deliveriesResult.value.data;
      deliverySummary.value = {
        total: pickNumber(data, [
          "total",
          "total_deliveries",
          "deliveries_total",
          "count",
        ]),
        by_status: normalizeStatusCounts<DeliveryStatus>(
          data,
          ["scheduled", "in_transit", "delivered", "failed", "cancelled"],
          dashboardDeliveryStatuses,
        ),
        revenue_series: [],
      };
    } else if (dashboardDeliveryStatuses.length) {
      deliverySummary.value = {
        total: dashboardDeliveryStatuses.reduce((total, row) => total + row.count, 0),
        by_status: normalizeStatusCounts<DeliveryStatus>(
          dashboardDeliveryStatuses,
          ["scheduled", "in_transit", "delivered", "failed", "cancelled"],
        ),
        revenue_series: [],
      };
    }

    if (paymentsResult.status === "fulfilled") {
      const data = paymentsResult.value.data;
      paymentSummary.value = {
        total: pickNumber(data, [
          "total",
          "total_payments",
          "payments_total",
          "count",
        ]),
        by_status: normalizeStatusCounts<PaymentStatus>(data, [
          "pending",
          "paid",
          "failed",
          "refunded",
        ]),
        revenue_series: normalizeRevenueSeries(data),
        paid_total: pickNumber(data, [
          "paid_total",
          "total_paid",
          "paid_revenue",
          "revenue",
          "total_revenue",
          "amount",
        ]),
      };
    }

    if (inventoryResult.status === "fulfilled") {
      const data = inventoryResult.value.data;
      inventorySummary.value = {
        total: pickNumber(data, ["total", "total_items", "inventory_total", "count"]),
        low_stock_count:
          pickNumber(data, ["low_stock_count", "low_stock_total"]) ||
          asArray(isRecord(data) ? data.low_stock_items ?? data.low_stock : []).length,
        low_stock_items: isRecord(data)
          ? (asArray(data.low_stock_items ?? data.low_stock).filter(isRecord) as DashboardInventorySummary["low_stock_items"])
          : [],
      };
    }

    if (productsResult.status === "fulfilled") {
      productInsights.value = {
        top_products: normalizeTopProducts(productsResult.value.data),
      };
    } else if (summary.value?.top_products?.length) {
      productInsights.value = {
        top_products: summary.value.top_products.slice(0, 6),
      };
    }

    if (!recentActivity.value.length && summary.value?.recent_orders?.length) {
      recentActivity.value = summary.value.recent_orders.slice(0, 10).map((entry) => ({
        id: `order-${entry.order.id}`,
        label: `Order ${entry.order.id}`,
        detail: `${entry.order.status} / ${entry.items} items`,
        date: entry.order.created_at,
        icon: "i-lucide-shopping-bag",
      }));
    }

    isLoading.value = false;

    const firstRejected = requests.find(
      (request) => request.status === "rejected",
    ) as PromiseRejectedResult | undefined;
    const hasFulfilled = requests.some((request) => request.status === "fulfilled");

    if (!hasFulfilled) {
      return {
        status: "error",
        message:
          toErrorMessage(firstRejected?.reason) ||
          "The dashboard summary could not be loaded right now.",
        statusMessage: "internal server error",
      };
    }

    return {
      status: "success",
      message: "Dashboard summary fetched successfully",
      statusMessage: firstRejected ? "partial content" : "ok",
    };
  };

  return {
    summary,
    recentActivity,
    orderSummary,
    deliverySummary,
    paymentSummary,
    inventorySummary,
    productInsights,
    isLoading,
    fetchDashboardData,
  };
});
