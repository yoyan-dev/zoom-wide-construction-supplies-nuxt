<script setup lang="ts">
import { storeToRefs } from "pinia";
import type { Customer } from "~/types/customer";
import AdminPageStateCard from "../../../_components/AdminPageStateCard.vue";
import OrderApproveModal from "../modals/OrderApproveModal.vue";
import OrderRejectModal from "../modals/OrderRejectModal.vue";
import OrderCustomerCard from "./OrderCustomerCard.vue";
import OrderItemsCard from "./OrderItemsCard.vue";
import OrderOverviewCard from "./OrderOverviewCard.vue";
import OrderTimelineCard from "./OrderTimelineCard.vue";
import { useAdminPageLoadState } from "~/composables/admin/useAdminPageLoadState";
import { useModal } from "~/composables/admin/useModal";

const props = defineProps<{
  backTo: string;
}>();

const route = useRoute();
const router = useRouter();
const orderId = computed(() => String(route.params.id));

const orderStore = useOrderStore();
const customerStore = useCustomerStore();
const { getLoadErrorMessage, isMissingResourceResponse } =
  useAdminPageLoadState();
const { openModal } = useModal();
const pageError = ref<string | null>(null);
const isMissingOrder = ref(false);
const isRetrying = ref(false);
const resolvedCustomer = ref<Customer | null>(null);

const loadCustomerSummary = async (customerId?: string | null) => {
  if (!customerId) {
    resolvedCustomer.value = null;
    return;
  }

  const customerResponse = await customerStore.fetchCustomerById(customerId);
  resolvedCustomer.value =
    customerResponse.status === "success" ? customerStore.customer : null;
};

const loadPage = async () => {
  resolvedCustomer.value = null;
  const orderResponse = await orderStore.fetchOrderById(orderId.value);

  isMissingOrder.value = isMissingResourceResponse(orderResponse);
  pageError.value =
    orderResponse.status === "error" && !isMissingOrder.value
      ? getLoadErrorMessage(
          [orderResponse],
          "The order record could not be loaded right now.",
        )
      : null;

  if (orderResponse.status === "success") {
    await loadCustomerSummary(orderStore.order?.customer_id ?? null);
  }
};

await loadPage();

watch(
  () => orderId.value,
  async () => {
    await loadPage();
  },
);

const { order, orderItems } = storeToRefs(orderStore);

const lineItems = computed(() =>
  order.value?.id
    ? orderItems.value.filter((item) => item.order_id === order.value?.id)
    : [],
);

const totalUnits = computed(() =>
  lineItems.value.reduce((sum, item) => sum + item.quantity, 0),
);

const goBack = () => {
  void router.push(props.backTo);
};

const approveOrder = () => {
  if (!order.value) return;
  void openModal(OrderApproveModal, order.value);
};

const rejectOrder = () => {
  if (!order.value) return;
  void openModal(OrderRejectModal, order.value);
};

const retryLoad = async () => {
  isRetrying.value = true;
  await loadPage();
  isRetrying.value = false;
};
</script>

<template>
  <div class="min-h-screen">
    <div class="space-y-6">
      <section class="rounded-sm bg-white p-2 dark:bg-gray-900">
        <div
          class="flex flex-col gap-4 md:flex-row md:items-center md:justify-between"
        >
          <div>
            <p class="text-xs uppercase tracking-[0.18em] text-slate-500">
              Order Details
            </p>
            <h1 class="mt-2 text-2xl font-semibold">
              {{ order?.id ? `Order ${order.id}` : "Order not found" }}
            </h1>
            <p class="mt-2 text-sm text-slate-600">
              Review customer context, item lines, totals, and current order status.
            </p>
          </div>
          <div class="flex flex-wrap items-center gap-2">
            <UButton color="neutral" variant="outline" @click="goBack">
              Back to Orders
            </UButton>
            <UButton
              v-if="order?.status === 'pending'"
              color="success"
              @click="approveOrder"
            >
              Approve Order
            </UButton>
            <UButton
              v-if="order?.status === 'pending'"
              color="error"
              variant="soft"
              @click="rejectOrder"
            >
              Reject Order
            </UButton>
          </div>
        </div>
      </section>

      <AdminPageStateCard
        v-if="pageError"
        eyebrow="Order Details"
        title="Order unavailable"
        :description="pageError"
        tone="error"
        action-label="Retry"
        :action-loading="isRetrying"
        @action="retryLoad"
      />

      <AdminPageStateCard
        v-else-if="isMissingOrder || !order"
        eyebrow="Order Details"
        title="Order not found"
        description="Check the URL or return to the orders list."
        action-label="Back to Orders"
        action-color="neutral"
        action-icon="i-lucide-arrow-left"
        @action="goBack"
      />

      <div v-else class="space-y-6">
        <div class="grid gap-6 xl:grid-cols-[minmax(0,1.2fr)_minmax(320px,0.9fr)]">
          <OrderOverviewCard
            :order="order"
            :line-item-count="lineItems.length"
            :total-units="totalUnits"
          />
          <OrderCustomerCard
            :customer="resolvedCustomer"
            :customer-id="order.customer_id"
          />
        </div>

        <div class="grid gap-6 xl:grid-cols-[minmax(0,1.2fr)_minmax(320px,0.9fr)]">
          <OrderItemsCard
            :items="lineItems"
            :total-amount="order.total_amount"
          />
          <OrderTimelineCard :order="order" />
        </div>
      </div>
    </div>
  </div>
</template>
