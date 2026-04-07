<script setup lang="ts">
import { storeToRefs } from "pinia";
import type { Customer } from "~/types/customer";
import type { Order } from "~/types/order";
import type { UpdateDeliveryPayload } from "~/types/delivery";
import AdminPageStateCard from "../../../_components/AdminPageStateCard.vue";
import DeliveryAssignmentCard from "./DeliveryAssignmentCard.vue";
import DeliveryCustomerCard from "./DeliveryCustomerCard.vue";
import DeliveryDestinationCard from "./DeliveryDestinationCard.vue";
import DeliveryItemsCard from "./DeliveryItemsCard.vue";
import DeliveryOrderSummaryCard from "./DeliveryOrderSummaryCard.vue";
import DeliveryOverviewCard from "./DeliveryOverviewCard.vue";
import DeliveryTimelineCard from "./DeliveryTimelineCard.vue";
import { useAdminPageLoadState } from "~/composables/admin/useAdminPageLoadState";

const props = defineProps<{
  backTo: string;
}>();

const route = useRoute();
const router = useRouter();
const toast = useToast();
const deliveryId = computed(() => String(route.params.id));

const deliveryStore = useDeliveryStore();
const driverStore = useDriverStore();
const orderStore = useOrderStore();
const customerStore = useCustomerStore();
const { getLoadErrorMessage, isMissingResourceResponse } =
  useAdminPageLoadState();
const pageError = ref<string | null>(null);
const isMissingDelivery = ref(false);
const isRetrying = ref(false);
const isLoadingPage = ref(false);
const isSavingAssignment = ref(false);
const resolvedOrder = ref<Order | null>(null);
const resolvedCustomer = ref<Customer | null>(null);

const loadOrderSummary = async (orderId?: string | null) => {
  if (!orderId) {
    resolvedOrder.value = null;
    return;
  }

  const orderResponse = await orderStore.fetchOrderById(orderId);
  resolvedOrder.value = orderResponse.status === "success" ? orderStore.order : null;
};

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
  isLoadingPage.value = true;
  resolvedOrder.value = null;
  resolvedCustomer.value = null;

  const [deliveryResponse, driversResponse] = await Promise.all([
    deliveryStore.fetchDeliveryById(deliveryId.value),
    driverStore.fetchDrivers({
      q: "",
      page: 1,
    }),
  ]);

  isMissingDelivery.value = isMissingResourceResponse(deliveryResponse);
  pageError.value =
    deliveryResponse.status === "error" && !isMissingDelivery.value
      ? getLoadErrorMessage(
          [deliveryResponse],
          "The delivery record could not be loaded right now.",
        )
      : null;

  if (driversResponse.status === "error") {
    console.warn("Driver options are unavailable for delivery assignment.");
  }

  if (deliveryResponse.status === "success") {
    await loadOrderSummary(deliveryStore.delivery?.order_id ?? null);

    if (resolvedOrder.value?.customer_id) {
      await loadCustomerSummary(resolvedOrder.value.customer_id);
    }
  }

  isLoadingPage.value = false;
};

await loadPage();

watch(
  () => deliveryId.value,
  async () => {
    await loadPage();
  },
);

const { delivery } = storeToRefs(deliveryStore);
const { drivers } = storeToRefs(driverStore);
const { orderItems } = storeToRefs(orderStore);

const lineItems = computed(() =>
  resolvedOrder.value?.id
    ? orderItems.value.filter((item) => item.order_id === resolvedOrder.value?.id)
    : [],
);

const orderBasePath = computed(() => props.backTo.replace(/\/deliveries$/, "/orders"));

const goBack = () => {
  void router.push(props.backTo);
};

const retryLoad = async () => {
  isRetrying.value = true;
  await loadPage();
  isRetrying.value = false;
};

const handleSaveAssignment = async (payload: UpdateDeliveryPayload) => {
  if (!delivery.value || isSavingAssignment.value) {
    return;
  }

  isSavingAssignment.value = true;

  const response = await deliveryStore.updateDelivery(delivery.value.id, payload);

  if (response.status === "error") {
    toast.add({
      title: "Delivery update failed",
      description: response.message || "Please try again.",
      color: "error",
      icon: "i-lucide-circle-alert",
    });
    isSavingAssignment.value = false;
    return;
  }

  toast.add({
    title: "Delivery updated",
    description:
      response.message || "Assignment and scheduling details were saved.",
    color: "success",
    icon: "i-lucide-circle-check",
  });

  await loadPage();
  isSavingAssignment.value = false;
};
</script>

<template>
  <div class="min-h-screen">
    <div class="space-y-6">
      <section class="rounded-sm bg-white p-2 dark:bg-gray-900">
        <div class="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p class="text-xs uppercase tracking-[0.18em] text-slate-500">
              Delivery Details
            </p>
            <h1 class="mt-2 text-2xl font-semibold">
              {{ delivery?.id ? `Delivery ${delivery.id}` : "Delivery not found" }}
            </h1>
            <p class="mt-2 text-sm text-slate-600">
              Review fulfillment status, linked order context, customer details, and assignment information.
            </p>
          </div>

          <UButton color="neutral" variant="outline" @click="goBack">
            Back to Deliveries
          </UButton>
        </div>
      </section>

      <AdminPageStateCard
        v-if="pageError"
        eyebrow="Delivery Details"
        title="Delivery unavailable"
        :description="pageError"
        tone="error"
        action-label="Retry"
        :action-loading="isRetrying"
        @action="retryLoad"
      />

      <AdminPageStateCard
        v-else-if="isMissingDelivery || (!isLoadingPage && !delivery)"
        eyebrow="Delivery Details"
        title="Delivery not found"
        description="Check the URL or return to the deliveries list."
        action-label="Back to Deliveries"
        action-color="neutral"
        action-icon="i-lucide-arrow-left"
        @action="goBack"
      />

      <div v-else-if="isLoadingPage" class="space-y-6">
        <UCard>
          <div class="space-y-4">
            <USkeleton class="h-6 w-48" />
            <USkeleton class="h-4 w-full" />
            <USkeleton class="h-4 w-40" />
          </div>
        </UCard>
        <UCard>
          <div class="space-y-4">
            <USkeleton class="h-5 w-44" />
            <USkeleton class="h-4 w-full" />
            <USkeleton class="h-4 w-full" />
          </div>
        </UCard>
      </div>

      <div v-else-if="delivery" class="space-y-6">
        <div class="grid gap-6 xl:grid-cols-[minmax(0,1.2fr)_minmax(320px,0.9fr)]">
          <DeliveryOverviewCard :delivery="delivery" />
          <DeliveryAssignmentCard
            :delivery="delivery"
            :drivers="drivers"
            :is-saving="isSavingAssignment"
            @save="handleSaveAssignment"
          />
        </div>

        <div class="grid gap-6 xl:grid-cols-[minmax(0,1.2fr)_minmax(320px,0.9fr)]">
          <DeliveryOrderSummaryCard
            :order="resolvedOrder"
            :order-base-path="orderBasePath"
          />
          <DeliveryCustomerCard
            :customer="resolvedCustomer"
            :customer-id="resolvedOrder?.customer_id"
          />
        </div>

        <div class="grid gap-6 xl:grid-cols-[minmax(0,1.2fr)_minmax(320px,0.9fr)]">
          <DeliveryItemsCard :items="lineItems" />
          <DeliveryDestinationCard :customer="resolvedCustomer" />
        </div>

        <DeliveryTimelineCard :delivery="delivery" />
      </div>
    </div>
  </div>
</template>
