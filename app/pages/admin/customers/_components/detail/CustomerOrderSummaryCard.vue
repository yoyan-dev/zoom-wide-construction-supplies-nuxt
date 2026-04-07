<script setup lang="ts">
import type { Customer } from "~/types/customer";
import type { Order, OrderStatus } from "~/types/order";
import {
  formatCurrency,
  formatLongDate,
  formatShortDateOrFallback,
} from "~/utils/format";

const props = defineProps<{
  customer: Customer;
}>();

type OrderStoreState = {
  orders?: Order[];
};

const pinia = usePinia();

// Existing admin components already reference an "orders" Pinia store, but the
// concrete store is not present in this workspace. Read from the root Pinia
// state only when that store has been registered so customer management stays
// safe even when order data is currently unavailable.
const orderStoreState = computed(
  () => pinia.state.value.orders as OrderStoreState | undefined,
);

const hasOrderSource = computed(() => Array.isArray(orderStoreState.value?.orders));

const customerOrders = computed(() =>
  (Array.isArray(orderStoreState.value?.orders) ? orderStoreState.value.orders : [])
    .filter((order) => order.customer_id === props.customer.id)
    .sort(
      (left, right) =>
        new Date(right.created_at).getTime() - new Date(left.created_at).getTime(),
    ),
);

const totalOrders = computed(() => customerOrders.value.length);
const mostRecentOrder = computed(() => customerOrders.value[0] ?? null);

const statusCounts = computed(() => {
  const counts: Partial<Record<OrderStatus, number>> = {};

  for (const order of customerOrders.value) {
    counts[order.status] = (counts[order.status] ?? 0) + 1;
  }

  return counts;
});

const statusPills = computed(() =>
  Object.entries(statusCounts.value)
    .map(([status, count]) => ({
      status,
      count,
    }))
    .sort((left, right) => right.count - left.count),
);

const recentOrders = computed(() => customerOrders.value.slice(0, 3));

const formatStatusLabel = (value: string) =>
  value.slice(0, 1).toUpperCase() + value.slice(1);

const summaryItems = computed(() => [
  {
    label: "Total Orders",
    value: String(totalOrders.value),
  },
  {
    label: "Most Recent Order",
    value: mostRecentOrder.value
      ? formatLongDate(mostRecentOrder.value.created_at)
      : "No orders yet",
  },
  {
    label: "Latest Order Total",
    value: mostRecentOrder.value
      ? formatCurrency(mostRecentOrder.value.total_amount)
      : formatCurrency(0),
  },
]);
</script>

<template>
  <UCard>
    <p class="text-xs uppercase tracking-[0.18em] text-slate-500">
      Order Activity
    </p>
    <h2 class="mt-2 text-xl font-semibold text-slate-900">
      Customer Order Summary
    </h2>
    <p class="mt-3 text-sm leading-6 text-slate-700">
      Lightweight customer-order context derived from the existing
      `Order.customer_id` relationship when a shared orders store is available.
    </p>

    <div
      v-if="!hasOrderSource"
      class="mt-6 rounded-sm border border-dashed border-slate-200 bg-white p-4 dark:bg-gray-900"
    >
      <p class="text-sm text-slate-600">
        Order history is not available in this workspace. The repository
        defines the customer-to-order relationship, but the shared orders store
        implementation is not currently present.
      </p>
    </div>

    <template v-else-if="totalOrders">
      <div class="mt-6 grid gap-4 md:grid-cols-3">
        <div v-for="item in summaryItems" :key="item.label">
          <p class="text-xs uppercase tracking-[0.18em] text-slate-500">
            {{ item.label }}
          </p>
          <p class="mt-2 text-lg font-semibold text-slate-800">
            {{ item.value }}
          </p>
        </div>
      </div>

      <div class="mt-6">
        <p class="text-xs uppercase tracking-[0.18em] text-slate-500">
          Status Breakdown
        </p>
        <div class="mt-3 flex flex-wrap gap-2">
          <UBadge
            v-for="item in statusPills"
            :key="item.status"
            color="info"
            variant="subtle"
          >
            {{ formatStatusLabel(item.status) }}: {{ item.count }}
          </UBadge>
        </div>
      </div>

      <div class="mt-6">
        <p class="text-xs uppercase tracking-[0.18em] text-slate-500">
          Recent Orders
        </p>
        <div class="mt-4 grid gap-3">
          <div
            v-for="order in recentOrders"
            :key="order.id"
            class="flex flex-col gap-3 rounded-lg border border-slate-200/70 p-4 md:flex-row md:items-center md:justify-between"
          >
            <div>
              <p class="font-medium text-slate-900">Order {{ order.id }}</p>
              <p class="mt-1 text-sm text-slate-500">
                {{ formatShortDateOrFallback(order.created_at, "_") }}
              </p>
            </div>
            <div class="flex flex-wrap items-center gap-2">
              <UBadge color="neutral" variant="subtle">
                {{ formatStatusLabel(order.status) }}
              </UBadge>
              <span class="text-sm font-medium text-slate-800">
                {{ formatCurrency(order.total_amount) }}
              </span>
            </div>
          </div>
        </div>
      </div>
    </template>

    <div
      v-else
      class="mt-6 rounded-sm border border-dashed border-slate-200 bg-white p-4 dark:bg-gray-900"
    >
      <p class="text-sm text-slate-600">
        No orders are linked to this customer in the currently available data.
      </p>
    </div>
  </UCard>
</template>
