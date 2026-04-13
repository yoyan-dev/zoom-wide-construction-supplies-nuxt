<script setup lang="ts">
import { storeToRefs } from "pinia";
import type { Customer } from "~/types/customer";
import type { Order } from "~/types/order";
import AdminPermissionNotice from "../../../_components/AdminPermissionNotice.vue";
import AdminPageStateCard from "../../../_components/AdminPageStateCard.vue";
import PaymentEditModal from "../modals/PaymentEditModal.vue";
import { useAdminPageLoadState } from "~/composables/admin/useAdminPageLoadState";
import { useModal } from "~/composables/admin/useModal";
import PaymentFinanceCard from "./PaymentFinanceCard.vue";
import PaymentOrderSummaryCard from "./PaymentOrderSummaryCard.vue";
import PaymentOverviewCard from "./PaymentOverviewCard.vue";
import PaymentStatusCard from "./PaymentStatusCard.vue";

const props = defineProps<{
  backTo: string;
  orderBasePath?: string;
}>();

const route = useRoute();
const router = useRouter();
const paymentId = computed(() => String(route.params.id));

const paymentStore = usePaymentStore();
const orderStore = useOrderStore();
const customerStore = useCustomerStore();
const authStore = useAuthStore();
const { getLoadErrorMessage, isMissingResourceResponse } =
  useAdminPageLoadState();
const { openModal } = useModal();
const pageError = ref<string | null>(null);
const isMissingPayment = ref(false);
const isRetrying = ref(false);
const resolvedOrder = ref<Order | null>(null);
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

const loadOrderSummary = async (orderId?: string | null) => {
  if (!orderId) {
    resolvedOrder.value = null;
    resolvedCustomer.value = null;
    return;
  }

  const orderResponse = await orderStore.fetchOrderById(orderId);
  resolvedOrder.value = orderResponse.status === "success" ? orderStore.order : null;

  if (resolvedOrder.value?.customer_id) {
    await loadCustomerSummary(resolvedOrder.value.customer_id);
  } else {
    resolvedCustomer.value = null;
  }
};

const loadPage = async () => {
  resolvedOrder.value = null;
  resolvedCustomer.value = null;

  const paymentResponse = await paymentStore.fetchPaymentById(paymentId.value);

  isMissingPayment.value = isMissingResourceResponse(paymentResponse);
  pageError.value =
    paymentResponse.status === "error" && !isMissingPayment.value
      ? getLoadErrorMessage(
          [paymentResponse],
          "The payment record could not be loaded right now.",
        )
      : null;

  if (paymentResponse.status === "success") {
    await loadOrderSummary(paymentStore.payment?.order_id ?? null);
  }
};

await loadPage();

watch(
  () => paymentId.value,
  async () => {
    await loadPage();
  },
);

const { payment } = storeToRefs(paymentStore);

const goBack = () => {
  void router.push(props.backTo);
};

const editPayment = () => {
  if (!payment.value || !authStore.hasAnyRole(["admin", "finance"])) return;
  void openModal(PaymentEditModal, payment.value);
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
              Payment Details
            </p>
            <h1 class="mt-2 text-2xl font-semibold">
              {{ payment?.id ? `Payment ${payment.id}` : "Payment not found" }}
            </h1>
            <p class="mt-2 text-sm text-slate-600">
              Review payment amount, status, method, timing, and linked order context.
            </p>
          </div>

          <div class="flex flex-wrap items-center gap-2">
            <UButton color="neutral" variant="outline" @click="goBack">
              Back to Payments
            </UButton>
            <UButton
              v-if="payment?.id && authStore.hasAnyRole(['admin', 'finance'])"
              color="primary"
              @click="editPayment"
            >
              Update Payment
            </UButton>
          </div>
        </div>
      </section>

      <AdminPageStateCard
        v-if="pageError"
        eyebrow="Payment Details"
        title="Payment unavailable"
        :description="pageError"
        tone="error"
        action-label="Retry"
        :action-loading="isRetrying"
        @action="retryLoad"
      />

      <AdminPageStateCard
        v-else-if="isMissingPayment || !payment"
        eyebrow="Payment Details"
        title="Payment not found"
        description="Check the URL or return to the payments list."
        action-label="Back to Payments"
        action-color="neutral"
        action-icon="i-lucide-arrow-left"
        @action="goBack"
      />

      <div v-else class="space-y-6">
        <AdminPermissionNotice
          v-if="!authStore.hasAnyRole(['admin', 'finance'])"
          description="Your role can review payment details, but changing payment status is restricted to finance-authorized accounts."
        />

        <div class="grid gap-6 xl:grid-cols-[minmax(0,1.2fr)_minmax(320px,0.9fr)]">
          <PaymentOverviewCard :payment="payment" />
          <PaymentStatusCard :payment="payment" />
        </div>

        <div class="grid gap-6 xl:grid-cols-[minmax(0,1.2fr)_minmax(320px,0.9fr)]">
          <PaymentOrderSummaryCard
            :payment="payment"
            :order="resolvedOrder"
            :order-base-path="props.orderBasePath"
          />
          <PaymentFinanceCard
            :payment="payment"
            :customer="resolvedCustomer"
          />
        </div>
      </div>
    </div>
  </div>
</template>
