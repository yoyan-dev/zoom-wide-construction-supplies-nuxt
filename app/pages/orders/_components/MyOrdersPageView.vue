<script setup lang="ts">
import { storeToRefs } from "pinia";
import type { FetchOrderParams } from "~/types/order";
import MyOrdersEmptyState from "./MyOrdersEmptyState.vue";
import MyOrdersHeader from "./MyOrdersHeader.vue";
import MyOrdersList from "./MyOrdersList.vue";
import MyOrdersStateCard from "./MyOrdersStateCard.vue";

const orderStore = useOrderStore();
const authStore = useAuthStore();
const pageError = ref<string | null>(null);
const isRetrying = ref(false);
const { customer } = storeToRefs(authStore);

const customerId = computed(() => customer.value?.id);

const requestParams = computed<FetchOrderParams>(() => ({
  q: "",
  status: "",
  page: 1,
  customer_id: customerId.value,
}));

const loadPage = async () => {
  if (!customerId.value) {
    pageError.value =
      "Your account does not have a linked customer record yet, so orders cannot be loaded.";
    return;
  }

  const ordersResponse = await orderStore.fetchOrders(requestParams.value);

  pageError.value =
    ordersResponse.status === "success"
      ? null
      : ordersResponse.message || "Your orders could not be loaded right now.";
};

await loadPage();

watch(
  () => customerId.value,
  async () => {
    await loadPage();
  },
);

const { orders, isLoading } = storeToRefs(orderStore);

const sortedOrders = computed(() =>
  [...orders.value].sort(
    (left, right) =>
      new Date(right.created_at).getTime() - new Date(left.created_at).getTime(),
  ),
);

const handleRetry = async () => {
  isRetrying.value = true;
  await loadPage();
  isRetrying.value = false;
};
</script>

<template>
  <div class="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-6 sm:px-6 lg:px-8">
    <MyOrdersHeader :total="sortedOrders.length" />

    <MyOrdersStateCard
      v-if="pageError"
      eyebrow="Order History"
      title="Orders unavailable"
      :description="pageError"
      tone="error"
      action-label="Retry"
      :action-loading="isRetrying"
      @action="handleRetry"
    />

    <MyOrdersEmptyState v-else-if="!isLoading && !sortedOrders.length" />

    <MyOrdersList
      v-else
      :orders="sortedOrders"
      :is-loading="isLoading"
    />
  </div>
</template>
