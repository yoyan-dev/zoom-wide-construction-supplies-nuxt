<script setup lang="ts">
import { storeToRefs } from "pinia";
import type { OrderStatus } from "~/types/order";
import AdminPageStateCard from "../../_components/AdminPageStateCard.vue";
import OrdersFilters from "./OrdersFilters.vue";
import OrderHeader from "./table/OrderHeader.vue";
import OrdersTable from "./table/OrdersTable.vue";
import { useAdminPageLoadState } from "~/composables/admin/useAdminPageLoadState";

const props = defineProps<{
  detailBasePath: string;
}>();

const orderStore = useOrderStore();
const customerStore = useCustomerStore();
const { getLoadErrorMessage } = useAdminPageLoadState();
const pageError = ref<string | null>(null);
const isRetrying = ref(false);

const loadPage = async () => {
  const [ordersResponse, customersResponse] = await Promise.all([
    orderStore.fetchOrders({
      q: "",
      status: "",
      page: 1,
    }),
    customerStore.fetchCustomers({
      q: "",
      page: 1,
    }),
  ]);

  pageError.value =
    ordersResponse.status === "success"
      ? null
      : getLoadErrorMessage(
          [ordersResponse],
          "The orders list could not be loaded right now.",
        );

  if (customersResponse.status === "error") {
    console.warn("Customer summaries are unavailable for the orders list.");
  }
};

await loadPage();

const { orders, totalOrders, query, pagination, isLoading } =
  storeToRefs(orderStore);
const { customers } = storeToRefs(customerStore);
const search = computed(() => query.value.q ?? "");
const status = ref("all");

const statusOptions = [
  { label: "All orders", value: "all" },
  { label: "Pending", value: "pending" },
  { label: "Approved", value: "approved" },
  { label: "Rejected", value: "rejected" },
  { label: "Cancelled", value: "cancelled" },
  { label: "Completed", value: "completed" },
];

const handleSearch = async (value: string) => {
  await orderStore.fetchOrders({
    q: value,
    status: status.value === "all" ? "" : (status.value as OrderStatus),
    page: 1,
  });
};

const handleStatus = async (value: string) => {
  status.value = value;

  await orderStore.fetchOrders({
    q: search.value,
    status: value === "all" ? "" : (value as OrderStatus),
    page: 1,
  });
};

const handlePageChange = async (page: number) => {
  await orderStore.fetchOrders({
    q: search.value,
    status: status.value === "all" ? "" : (status.value as OrderStatus),
    page,
  });
};

const handleRetry = async () => {
  isRetrying.value = true;
  await loadPage();
  isRetrying.value = false;
};
</script>

<template>
  <div class="min-h-screen">
    <div class="space-y-6">
      <OrderHeader :total="totalOrders" />

      <template v-if="pageError">
        <AdminPageStateCard
          eyebrow="Orders"
          title="Orders unavailable"
          :description="pageError"
          tone="error"
          action-label="Retry"
          :action-loading="isRetrying"
          @action="handleRetry"
        />
      </template>

      <template v-else>
        <OrdersFilters
          :search="search"
          :status="status"
          :status-options="statusOptions"
          @update:search="handleSearch"
          @update:status="handleStatus"
        />
        <OrdersTable
          :orders="orders"
          :customers="customers"
          :search="search"
          :status="status"
          :detail-base-path="props.detailBasePath"
          :is-loading="isLoading"
          :pagination="pagination"
          @page-change="handlePageChange"
        />
      </template>
    </div>
  </div>
</template>
