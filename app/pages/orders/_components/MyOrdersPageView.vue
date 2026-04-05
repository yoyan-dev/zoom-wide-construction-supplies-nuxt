<script setup lang="ts">
import { storeToRefs } from "pinia";
import type { FetchOrderParams } from "~/types/order";
import { formatNumber } from "~/utils/format";
import MyOrdersEmptyState from "./MyOrdersEmptyState.vue";
import MyOrdersHeader from "./MyOrdersHeader.vue";
import MyOrdersList from "./MyOrdersList.vue";
import MyOrdersPagination from "./MyOrdersPagination.vue";
import MyOrdersStateCard from "./MyOrdersStateCard.vue";

const orderStore = useOrderStore();
const authStore = useAuthStore();
const pageError = ref<string | null>(null);
const isRetrying = ref(false);
const searchDraft = ref("");
const activeSearch = ref("");
const activeStatus = ref("");
const currentPage = ref(1);
const { customer, isAuthenticated } = storeToRefs(authStore);

const customerId = computed(() => customer.value?.id);

const requestParams = computed<FetchOrderParams>(() => ({
  q: activeSearch.value,
  status: activeStatus.value as FetchOrderParams["status"],
  page: currentPage.value,
  customer_id: customerId.value,
}));

const loadPage = async () => {
  if (!isAuthenticated.value) {
    pageError.value = null;
    return;
  }

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

const { orders, isLoading, pagination, totalOrders } = storeToRefs(orderStore);

const sortedOrders = computed(() =>
  [...orders.value].sort(
    (left, right) =>
      new Date(right.created_at).getTime() - new Date(left.created_at).getTime(),
  ),
);

const pendingCount = computed(
  () => sortedOrders.value.filter((order) => order.status === "pending").length,
);

const approvedCount = computed(
  () => sortedOrders.value.filter((order) => order.status === "approved").length,
);

const completedCount = computed(
  () => sortedOrders.value.filter((order) => order.status === "completed").length,
);

const hasFilters = computed(() => Boolean(activeSearch.value || activeStatus.value));

const visiblePageNumbers = computed(() => {
  const totalPages = pagination.value.totalPages ?? 1;

  if (totalPages <= 1) {
    return [];
  }

  const pages = new Set<number>([1, totalPages, currentPage.value]);

  for (let offset = 1; offset <= 1; offset += 1) {
    pages.add(Math.max(1, currentPage.value - offset));
    pages.add(Math.min(totalPages, currentPage.value + offset));
  }

  return [...pages].sort((left, right) => left - right);
});

const statusOptions = [
  { label: "All statuses", value: "" },
  { label: "Pending", value: "pending" },
  { label: "Approved", value: "approved" },
  { label: "Rejected", value: "rejected" },
  { label: "Cancelled", value: "cancelled" },
  { label: "Completed", value: "completed" },
] as const;

const handleRetry = async () => {
  isRetrying.value = true;
  await loadPage();
  isRetrying.value = false;
};

const handleSearchSubmit = async () => {
  activeSearch.value = searchDraft.value.trim();
  currentPage.value = 1;
  await loadPage();
};

const handleStatusChange = async (value: string) => {
  activeStatus.value = value;
  currentPage.value = 1;
  await loadPage();
};

const handleReset = async () => {
  searchDraft.value = "";
  activeSearch.value = "";
  activeStatus.value = "";
  currentPage.value = 1;
  await loadPage();
};

const handlePageChange = async (page: number) => {
  if (page === currentPage.value) {
    return;
  }

  currentPage.value = page;
  await loadPage();
};
</script>

<template>
  <StorefrontPageContainer size="wide" class="py-8 md:py-10">
    <MyOrdersHeader
      :total="totalOrders || sortedOrders.length"
      :pending-count="pendingCount"
      :approved-count="approvedCount"
      :completed-count="completedCount"
    />

    <MyOrdersStateCard
      v-if="!isAuthenticated"
      class="mt-6"
      eyebrow="Orders"
      title="Sign in to view your orders"
      description="Your order list is available once you sign in with a customer account."
    >
      <template #actions>
        <div class="flex flex-wrap gap-3">
          <StorefrontButton tone="primary" to="/auth/login?redirect=/orders">
            Sign in
          </StorefrontButton>
          <StorefrontButton tone="secondary" to="/shop">
            Browse shop
          </StorefrontButton>
        </div>
      </template>
    </MyOrdersStateCard>

    <MyOrdersStateCard
      v-else-if="pageError"
      class="mt-6"
      eyebrow="Order History"
      title="Orders unavailable"
      :description="pageError"
      tone="error"
    >
      <template #actions>
        <StorefrontButton
          tone="danger"
          :loading="isRetrying"
          @click="handleRetry"
        >
          Retry
        </StorefrontButton>
      </template>
    </MyOrdersStateCard>

    <template v-else>
      <StorefrontSectionCard class="mt-6" padding="lg">
        <div class="flex flex-col gap-4">
          <div class="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
            <form class="flex flex-1 items-center gap-3" @submit.prevent="handleSearchSubmit">
              <StorefrontInput
                v-model="searchDraft"
                icon="i-lucide-search"
                placeholder="Search by order reference or notes"
              />
              <StorefrontButton type="submit" tone="primary">
                Search
              </StorefrontButton>
            </form>

            <div class="flex items-center gap-3">
              <span class="text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-slate-500">
                Status
              </span>
              <select
                :value="activeStatus"
                class="rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-900 outline-none transition focus:border-slate-300"
                @change="handleStatusChange(($event.target as HTMLSelectElement).value)"
              >
                <option
                  v-for="option in statusOptions"
                  :key="option.label"
                  :value="option.value"
                >
                  {{ option.label }}
                </option>
              </select>
            </div>
          </div>

          <div class="flex flex-wrap items-center gap-2">
            <UBadge color="warning" variant="soft">
              {{ formatNumber(totalOrders || sortedOrders.length) }} total orders
            </UBadge>
            <UBadge v-if="activeStatus" color="neutral" variant="subtle">
              Status: {{ activeStatus }}
            </UBadge>
            <UBadge v-if="activeSearch" color="neutral" variant="subtle">
              Search: {{ activeSearch }}
            </UBadge>
            <StorefrontButton
              v-if="hasFilters"
              tone="ghost"
              size="sm"
              @click="handleReset"
            >
              Clear filters
            </StorefrontButton>
          </div>
        </div>
      </StorefrontSectionCard>

      <MyOrdersEmptyState v-if="!isLoading && !sortedOrders.length" class="mt-6" />

      <template v-else>
        <MyOrdersList
          class="mt-6"
          :orders="sortedOrders"
          :is-loading="isLoading"
        />

        <div class="mt-8">
          <MyOrdersPagination
            :current-page="currentPage"
            :total-pages="pagination.totalPages || 1"
            :pages="visiblePageNumbers"
            @change="handlePageChange"
          />
        </div>
      </template>
    </template>
  </StorefrontPageContainer>
</template>
