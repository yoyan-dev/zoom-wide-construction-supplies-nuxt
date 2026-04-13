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

const orderStatusSummary = computed(() =>
  orderSummary.value.by_status as Array<{ status: OrderStatus; count: number }>,
);

const deliveryStatusSummary = computed(() =>
  deliverySummary.value.by_status as Array<{
    status: DeliveryStatus;
    count: number;
  }>,
);

const paymentStatusSummary = computed(() =>
  paymentSummary.value.by_status as Array<{
    status: PaymentStatus;
    count: number;
  }>,
);

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
        v-if="isLoading && !summary"
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

      <section class="grid gap-4 xl:grid-cols-[minmax(0,1fr)_360px]">
        <div class="space-y-4">
          <article class="rounded-sm bg-white p-5 shadow-sm dark:bg-gray-900">
            <div class="flex items-center justify-between gap-3">
              <h2 class="text-xl font-semibold tracking-tight text-slate-900">
                Revenue Snapshots
              </h2>
              <UBadge color="neutral" variant="subtle">
                {{ summary?.range_label ?? "Current range" }}
              </UBadge>
            </div>

            <div v-if="revenueTrendBars.length" class="mt-5 space-y-3">
              <div
                v-for="row in revenueTrendBars"
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
              Revenue totals will appear here once summary records are
              available.
            </p>
          </article>

          <article class="rounded-sm bg-white p-5 shadow-sm dark:bg-gray-900">
            <div class="flex items-center justify-between gap-3">
              <h2 class="text-xl font-semibold tracking-tight text-slate-900">
                Top Products
              </h2>
              <UBadge color="neutral" variant="subtle">
                {{ topProductRows.length }} signals
              </UBadge>
            </div>

            <div v-if="topProductRows.length" class="mt-5 space-y-3">
              <div
                v-for="row in topProductRows"
                :key="row.product.id ?? row.product.name"
                class="flex items-center justify-between gap-4 rounded-sm border border-slate-200/70 bg-white p-3 dark:bg-gray-900"
              >
                <div class="min-w-0">
                  <p class="truncate font-medium text-slate-900">
                    {{ row.product.name ?? "Unnamed product" }}
                  </p>
                  <p class="text-xs text-slate-500">
                    {{ row.units_sold }} units sold
                  </p>
                </div>
                <span class="shrink-0 text-sm font-semibold text-slate-900">
                  {{ formatCurrency(row.revenue) }}
                </span>
              </div>
            </div>
            <p v-else class="mt-5 text-sm text-slate-600">
              Product insights will appear once sales activity is available.
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

        <aside class="rounded-sm bg-white p-5 shadow-sm dark:bg-gray-900">
          <div class="flex items-center justify-between gap-3">
            <h2 class="text-xl font-semibold tracking-tight text-slate-900">
              Activity Feed
            </h2>
            <UBadge color="warning" variant="subtle">
              Live context
            </UBadge>
          </div>

          <div v-if="recentActivity.length" class="mt-5 space-y-3">
            <article
              v-for="entry in recentActivity"
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
        </aside>
      </section>
    </template>
  </div>
</template>
