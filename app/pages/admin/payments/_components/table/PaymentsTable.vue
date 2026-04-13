<script setup lang="ts">
import type { TableColumn } from "@nuxt/ui";
import type { Customer } from "~/types/customer";
import type { Order } from "~/types/order";
import type { PaginationMeta } from "~/types/pagination";
import type { Payment, PaymentMethod } from "~/types/payment";
import { getPaymentStatusBadge } from "~/pages/orders/_components/shared/payment-status";
import { formatCurrency, formatLongDate, formatShortDateOrFallback } from "~/utils/format";
import AdminTableEmptyState from "../../../_components/AdminTableEmptyState.vue";
import AdminServerPagination from "../../../_components/AdminServerPagination.vue";
import PaymentRowActions from "./PaymentRowActions.vue";

const props = defineProps<{
  payments: Payment[];
  orders: Order[];
  customers: Customer[];
  search: string;
  status: string;
  method: string;
  detailBasePath: string;
  orderBasePath?: string;
  isLoading: boolean;
  pagination: PaginationMeta;
}>();

const emit = defineEmits<{
  (event: "page-change", page: number): void;
}>();

const orderById = computed(() =>
  new Map(props.orders.map((order) => [order.id, order])),
);

const customerById = computed(() =>
  new Map(props.customers.map((customer) => [customer.id, customer])),
);

const hasRows = computed(() => props.payments.length > 0);
const hasSearch = computed(() => props.search.trim().length > 0);
const hasStatusFilter = computed(() => props.status !== "all");
const hasMethodFilter = computed(() => props.method !== "all");

const emptyTitle = computed(() =>
  hasSearch.value || hasStatusFilter.value || hasMethodFilter.value
    ? "No payments match the current filters"
    : "No payment records yet",
);

const emptyDescription = computed(() =>
  hasSearch.value || hasStatusFilter.value || hasMethodFilter.value
    ? "Try a different search term, status, or payment method."
    : "Payment records will appear here once they are available in the system.",
);

const columns: TableColumn<Payment>[] = [
  { id: "payment", header: "Payment", accessorFn: (row) => row.id },
  { id: "order", header: "Order", accessorFn: (row) => row.order_id },
  { id: "method", header: "Method", accessorFn: (row) => row.method },
  { id: "status", header: "Status", accessorFn: (row) => row.status },
  { id: "date", header: "Date", accessorFn: (row) => row.paid_at ?? row.created_at },
  { id: "actions", header: "" },
];

const resolveOrder = (orderId: string) => orderById.value.get(orderId) ?? null;

const resolveCustomer = (payment: Payment) => {
  const order = resolveOrder(payment.order_id);
  return order?.customer_id ? (customerById.value.get(order.customer_id) ?? null) : null;
};

const getCustomerDisplayName = (payment: Payment) => {
  const customer = resolveCustomer(payment);
  return (
    customer?.company_name ??
    customer?.contact_name ??
    "Customer payment"
  );
};

const getCustomerSupportText = (payment: Payment) => {
  const customer = resolveCustomer(payment);

  if (customer?.company_name && customer?.contact_name) {
    return customer.contact_name;
  }

  return customer?.email ?? customer?.phone ?? "Customer details unavailable";
};

const paymentMethodLabel = (method: PaymentMethod) => {
  switch (method) {
    case "bank_transfer":
      return "Bank Transfer";
    case "mobile_wallet":
      return "Mobile Wallet";
    case "card":
      return "Card";
    default:
      return "Cash";
  }
};
</script>

<template>
  <UCard>
    <UTable
      v-if="props.isLoading || hasRows"
      :data="props.payments"
      :columns="columns"
      class="text-sm"
      :loading="props.isLoading"
    >
      <template #payment-cell="{ row }">
        <div class="flex flex-col">
          <NuxtLink
            :to="`${props.detailBasePath}/${row.original.id}`"
            class="font-medium text-slate-900 transition hover:text-primary"
          >
            Payment from {{ getCustomerDisplayName(row.original) }}
          </NuxtLink>
          <span class="text-xs text-slate-500">
            {{
              row.original.transaction_ref
                ? `Ref ${row.original.transaction_ref}`
                : "No transaction reference"
            }}
          </span>
        </div>
      </template>

      <template #order-cell="{ row }">
        <div class="flex flex-col">
          <NuxtLink
            v-if="props.orderBasePath"
            :to="`${props.orderBasePath}/${row.original.order_id}`"
            class="font-medium text-slate-900 transition hover:text-primary"
          >
            Order for {{ getCustomerDisplayName(row.original) }}
          </NuxtLink>
          <span v-else class="font-medium text-slate-900">
            Order for {{ getCustomerDisplayName(row.original) }}
          </span>
          <span class="text-xs text-slate-500">
            {{ getCustomerSupportText(row.original) }}
          </span>
        </div>
      </template>

      <template #method-cell="{ row }">
        <div class="flex flex-col">
          <span class="font-medium text-slate-900">
            {{ paymentMethodLabel(row.original.method) }}
          </span>
          <span class="text-xs text-slate-500">
            {{ formatCurrency(row.original.amount ?? 0) }}
          </span>
        </div>
      </template>

      <template #status-cell="{ row }">
        <UBadge :color="getPaymentStatusBadge(row.original.status).color" variant="subtle">
          {{ getPaymentStatusBadge(row.original.status).label }}
        </UBadge>
      </template>

      <template #date-cell="{ row }">
        <div class="flex flex-col">
          <span class="font-medium text-slate-900">
            {{
              row.original.paid_at
                ? formatLongDate(row.original.paid_at)
                : "Not paid yet"
            }}
          </span>
          <span class="text-xs text-slate-500">
            Created {{ formatShortDateOrFallback(row.original.created_at) }}
          </span>
        </div>
      </template>

      <template #actions-cell="{ row }">
        <div class="flex justify-end">
          <PaymentRowActions
            :payment="row.original"
            :detail-base-path="props.detailBasePath"
            :order-base-path="props.orderBasePath"
          />
        </div>
      </template>
    </UTable>

    <AdminTableEmptyState
      v-else
      :title="emptyTitle"
      :description="emptyDescription"
    />
    <AdminServerPagination
      v-if="hasRows"
      :pagination="props.pagination"
      @page-change="emit('page-change', $event)"
    />
  </UCard>
</template>
