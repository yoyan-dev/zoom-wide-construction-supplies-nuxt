<script setup lang="ts">
import { storeToRefs } from "pinia";
import type { PaymentMethod, PaymentStatus } from "~/types/payment";
import AdminPageStateCard from "../../_components/AdminPageStateCard.vue";
import AddPaymentModal from "./modals/AddPaymentModal.vue";
import { useAdminPageLoadState } from "~/composables/admin/useAdminPageLoadState";
import { useModal } from "~/composables/admin/useModal";
import PaymentsFilters from "./PaymentsFilters.vue";
import PaymentSummaryCards from "./PaymentSummaryCards.vue";
import PaymentHeader from "./table/PaymentHeader.vue";
import PaymentsTable from "./table/PaymentsTable.vue";

const props = defineProps<{
  detailBasePath: string;
  orderBasePath?: string;
}>();

const paymentStore = usePaymentStore();
const orderStore = useOrderStore();
const customerStore = useCustomerStore();
const { openModal } = useModal();
const { getLoadErrorMessage } = useAdminPageLoadState();
const pageError = ref<string | null>(null);
const isRetrying = ref(false);

const loadPage = async () => {
  const [paymentsResponse, ordersResponse, customersResponse] = await Promise.all([
    paymentStore.fetchPayments({
      q: "",
      status: "",
      method: "",
      order_id: undefined,
      page: 1,
    }),
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
    paymentsResponse.status === "success"
      ? null
      : getLoadErrorMessage(
          [paymentsResponse],
          "The payments list could not be loaded right now.",
        );

  if (ordersResponse.status === "error") {
    console.warn("Order summaries are unavailable for the payments list.");
  }

  if (customersResponse.status === "error") {
    console.warn("Customer summaries are unavailable for the payments list.");
  }
};

await loadPage();

const { payments, query, isLoading } = storeToRefs(paymentStore);
const { orders } = storeToRefs(orderStore);
const { customers } = storeToRefs(customerStore);
const search = computed(() => query.value.q ?? "");
const status = ref("all");
const method = ref("all");

const statusOptions = [
  { label: "All payment status", value: "all" },
  { label: "Pending", value: "pending" },
  { label: "Paid", value: "paid" },
  { label: "Failed", value: "failed" },
  { label: "Refunded", value: "refunded" },
];

const methodOptions = [
  { label: "All methods", value: "all" },
  { label: "Cash", value: "cash" },
  { label: "Card", value: "card" },
  { label: "Bank Transfer", value: "bank_transfer" },
  { label: "Mobile Wallet", value: "mobile_wallet" },
];

const fetchWithFilters = async () => {
  await paymentStore.fetchPayments({
    q: search.value,
    status: status.value === "all" ? "" : (status.value as PaymentStatus),
    method: method.value === "all" ? "" : (method.value as PaymentMethod),
    order_id: undefined,
    page: 1,
  });
};

const handleSearch = async (value: string) => {
  await paymentStore.fetchPayments({
    q: value,
    status: status.value === "all" ? "" : (status.value as PaymentStatus),
    method: method.value === "all" ? "" : (method.value as PaymentMethod),
    order_id: undefined,
    page: 1,
  });
};

const handleStatus = async (value: string) => {
  status.value = value;
  await fetchWithFilters();
};

const handleMethod = async (value: string) => {
  method.value = value;
  await fetchWithFilters();
};

const handleCreate = () => {
  void openModal(AddPaymentModal, {
    orders: orders.value,
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
      <PaymentHeader :total="payments.length" @create="handleCreate" />

      <template v-if="pageError">
        <AdminPageStateCard
          eyebrow="Payments"
          title="Payments unavailable"
          :description="pageError"
          tone="error"
          action-label="Retry"
          :action-loading="isRetrying"
          @action="handleRetry"
        />
      </template>

      <template v-else>
        <PaymentSummaryCards :payments="payments" />
        <PaymentsFilters
          :search="search"
          :status="status"
          :method="method"
          :status-options="statusOptions"
          :method-options="methodOptions"
          @update:search="handleSearch"
          @update:status="handleStatus"
          @update:method="handleMethod"
        />
        <PaymentsTable
          :payments="payments"
          :orders="orders"
          :customers="customers"
          :search="search"
          :status="status"
          :method="method"
          :detail-base-path="props.detailBasePath"
          :order-base-path="props.orderBasePath"
          :is-loading="isLoading"
        />
      </template>
    </div>
  </div>
</template>
