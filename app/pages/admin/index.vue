<script setup lang="ts">
import { storeToRefs } from "pinia";
import type { DeliveryStatus } from "~/types/delivery";
import type { OrderStatus } from "~/types/order";
import type { PaymentStatus } from "~/types/payment";
import AdminPageStateCard from "./_components/AdminPageStateCard.vue";
import DashboardActivityFeed from "./_components/dashboard/DashboardActivityFeed.vue";
import DashboardHero from "./_components/dashboard/DashboardHero.vue";
import DashboardKpiGrid from "./_components/dashboard/DashboardKpiGrid.vue";
import DashboardRevenueCard from "./_components/dashboard/DashboardRevenueCard.vue";
import DashboardStatusSummaryGrid from "./_components/dashboard/DashboardStatusSummaryGrid.vue";
import DashboardTopProductsCard from "./_components/dashboard/DashboardTopProductsCard.vue";
import { formatCurrency, formatShortDateOrFallback } from "~/utils/format";
import { progressWidthClass } from "~/utils/tailwind";

definePageMeta({
  layout: "admin",
});

const dashboardStore = useDashboardStore();
const pageError = ref<string | null>(null);
const isRetrying = ref(false);

const loadDashboard = async () => {
  const response = await dashboardStore.fetchDashboardData();
  pageError.value = response.status === "error" ? response.message : null;
};

await loadDashboard();

const {
  summary,
  recentActivity,
  orderSummary,
  deliverySummary,
  paymentSummary,
  inventorySummary,
  productInsights,
  isLoading,
} = storeToRefs(dashboardStore);

const getKpi = (id: string) =>
  summary.value?.kpis?.find((kpi) => kpi.id === id);

const getStatusCount = <T extends string>(
  rows: Array<{ status: T | string; count: number }>,
  status: T,
) => rows.find((row) => row.status === status)?.count ?? 0;

const formatKpiValue = (id: string, fallback: number, currency = false) => {
  const kpi = getKpi(id);
  const value = Number(kpi?.value ?? fallback);
  return currency || kpi?.unit === "currency"
    ? formatCurrency(value)
    : String(value);
};

const kpiCards = computed(() => [
  {
    title: getKpi("revenue")?.label ?? "Paid Revenue",
    value: formatKpiValue("revenue", paymentSummary.value.paid_total, true),
    description: `${paymentSummary.value.total} payments summarized`,
    icon: "i-lucide-wallet",
  },
  {
    title: getKpi("orders_today")?.label ?? "Orders Today",
    value: formatKpiValue("orders_today", orderSummary.value.total),
    description: `${getStatusCount(orderSummary.value.by_status, "pending")} pending orders`,
    icon: "i-lucide-shopping-cart",
  },
  {
    title: getKpi("pending_deliveries")?.label ?? "Pending Deliveries",
    value: formatKpiValue(
      "pending_deliveries",
      getStatusCount(deliverySummary.value.by_status, "scheduled") +
        getStatusCount(deliverySummary.value.by_status, "in_transit"),
    ),
    description: `${deliverySummary.value.total} delivery records`,
    icon: "i-lucide-truck",
  },
  {
    title: getKpi("low_stock")?.label ?? "Low Stock",
    value: formatKpiValue("low_stock", inventorySummary.value.low_stock_count),
    description: `${inventorySummary.value.total} inventory records`,
    icon: "i-lucide-package-open",
  },
]);

const orderStatusSummary = computed(
  () =>
    orderSummary.value.by_status as Array<{
      status: OrderStatus;
      count: number;
    }>,
);

const deliveryStatusSummary = computed(
  () =>
    deliverySummary.value.by_status as Array<{
      status: DeliveryStatus;
      count: number;
    }>,
);

const paymentStatusSummary = computed(
  () =>
    paymentSummary.value.by_status as Array<{
      status: PaymentStatus;
      count: number;
    }>,
);

const statusSummarySections = computed(() => [
  {
    label: "Order Status",
    rows: orderStatusSummary.value,
  },
  {
    label: "Delivery Status",
    rows: deliveryStatusSummary.value,
  },
  {
    label: "Payment Status",
    rows: paymentStatusSummary.value,
  },
]);

const revenueTrendBars = computed(() => {
  const rows = (
    summary.value?.revenue_series?.length
      ? summary.value.revenue_series
      : paymentSummary.value.revenue_series.length
        ? paymentSummary.value.revenue_series
        : orderSummary.value.revenue_series
  )
    .map((point) => ({
      label: formatShortDateOrFallback(point.date, point.date),
      total: Number(point.revenue ?? 0),
    }))
    .slice(0, 6);

  const maxTotal = rows.reduce((max, row) => Math.max(max, row.total), 0);

  return rows.map((row) => ({
    ...row,
    widthClass: progressWidthClass(
      maxTotal > 0 ? Math.max((row.total / maxTotal) * 100, 6) : 0,
    ),
  }));
});

const topProductRows = computed(() =>
  productInsights.value.top_products.length
    ? productInsights.value.top_products
    : (summary.value?.top_products ?? []),
);

const handleRetry = async () => {
  isRetrying.value = true;
  await loadDashboard();
  isRetrying.value = false;
};
</script>

<template>
  <div class="min-h-screen space-y-6">
    <DashboardHero />

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
        v-if="isLoading && !summary"
        class="grid gap-4 sm:grid-cols-2 xl:grid-cols-4"
      >
        <USkeleton v-for="idx in 4" :key="idx" class="h-32 rounded-lg" />
      </section>

      <DashboardKpiGrid v-else :cards="kpiCards" />

      <section class="grid gap-4 xl:grid-cols-[minmax(0,1fr)_360px]">
        <div class="space-y-4">
          <DashboardRevenueCard
            :range-label="summary?.range_label ?? 'Current range'"
            :rows="revenueTrendBars as any"
          />
          <DashboardTopProductsCard :rows="topProductRows" />
          <DashboardStatusSummaryGrid :sections="statusSummarySections" />
        </div>

        <DashboardActivityFeed :entries="recentActivity" />
      </section>
    </template>
  </div>
</template>
