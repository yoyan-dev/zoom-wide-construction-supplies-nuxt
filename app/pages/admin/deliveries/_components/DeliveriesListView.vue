<script setup lang="ts">
import { storeToRefs } from "pinia";
import type { DeliveryStatus } from "~/types/delivery";
import AdminPageStateCard from "../../_components/AdminPageStateCard.vue";
import AddDeliveryModal from "./modals/AddDeliveryModal.vue";
import { useAdminPageLoadState } from "~/composables/admin/useAdminPageLoadState";
import { useModal } from "~/composables/admin/useModal";
import DeliveriesFilters from "./DeliveriesFilters.vue";
import DeliveryHeader from "./table/DeliveryHeader.vue";
import DeliveriesTable from "./table/DeliveriesTable.vue";

const props = defineProps<{
  detailBasePath: string;
}>();

const deliveryStore = useDeliveryStore();
const orderStore = useOrderStore();
const customerStore = useCustomerStore();
const driverStore = useDriverStore();
const { openModal } = useModal();
const { getLoadErrorMessage } = useAdminPageLoadState();
const pageError = ref<string | null>(null);
const isRetrying = ref(false);

const loadPage = async () => {
  const [deliveriesResponse, ordersResponse, customersResponse, driversResponse] =
    await Promise.all([
      deliveryStore.fetchDeliveries({
        q: "",
        status: "",
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
      driverStore.fetchDrivers({
        q: "",
        page: 1,
      }),
    ]);

  pageError.value =
    deliveriesResponse.status === "success"
      ? null
      : getLoadErrorMessage(
          [deliveriesResponse],
          "The deliveries list could not be loaded right now.",
        );

  if (ordersResponse.status === "error") {
    console.warn("Order summaries are unavailable for the deliveries list.");
  }

  if (customersResponse.status === "error") {
    console.warn("Customer summaries are unavailable for the deliveries list.");
  }

  if (driversResponse.status === "error") {
    console.warn("Driver options are unavailable for delivery actions.");
  }
};

await loadPage();

const { deliveries, totalDeliveries, query, isLoading } =
  storeToRefs(deliveryStore);
const { orders } = storeToRefs(orderStore);
const { customers } = storeToRefs(customerStore);
const { drivers } = storeToRefs(driverStore);

const search = computed(() => query.value.q ?? "");
const status = ref("all");

const statusOptions = [
  { label: "All deliveries", value: "all" },
  { label: "Scheduled", value: "scheduled" },
  { label: "In transit", value: "in_transit" },
  { label: "Delivered", value: "delivered" },
  { label: "Failed", value: "failed" },
  { label: "Cancelled", value: "cancelled" },
];

const handleSearch = async (value: string) => {
  await deliveryStore.fetchDeliveries({
    q: value,
    status: status.value === "all" ? "" : (status.value as DeliveryStatus),
    page: 1,
  });
};

const handleStatus = async (value: string) => {
  status.value = value;

  await deliveryStore.fetchDeliveries({
    q: search.value,
    status: value === "all" ? "" : (value as DeliveryStatus),
    page: 1,
  });
};

const handleCreate = () => {
  void openModal(AddDeliveryModal, {
    orders: orders.value,
    drivers: drivers.value,
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
      <DeliveryHeader :total="totalDeliveries" @create="handleCreate" />

      <template v-if="pageError">
        <AdminPageStateCard
          eyebrow="Deliveries"
          title="Deliveries unavailable"
          :description="pageError"
          tone="error"
          action-label="Retry"
          :action-loading="isRetrying"
          @action="handleRetry"
        />
      </template>

      <template v-else>
        <DeliveriesFilters
          :search="search"
          :status="status"
          :status-options="statusOptions"
          @update:search="handleSearch"
          @update:status="handleStatus"
        />
        <DeliveriesTable
          :deliveries="deliveries"
          :orders="orders"
          :customers="customers"
          :drivers="drivers"
          :search="search"
          :status="status"
          :detail-base-path="props.detailBasePath"
          :is-loading="isLoading"
        />
      </template>
    </div>
  </div>
</template>
