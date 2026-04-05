<script setup lang="ts">
import { storeToRefs } from "pinia";
import AdminPageStateCard from "~/pages/admin/_components/AdminPageStateCard.vue";
import DriverDeliveriesFilters from "./DriverDeliveriesFilters.vue";
import DriverDeliveriesTable from "./DriverDeliveriesTable.vue";

const props = defineProps<{
  scope: "assigned" | "completed";
}>();

const accountStore = useAccountStore();
const driverOrdersStore = useDriverOrdersStore();

const { account } = storeToRefs(accountStore);
const { orders, isLoading } = storeToRefs(driverOrdersStore);

const search = ref("");
const status = ref("all");
const pageError = ref<string | null>(null);
const isRetrying = ref(false);

const driver = computed(() => account.value?.driver ?? null);

const filteredOrders = computed(() => {
  const orderSearch = search.value.trim().toLowerCase();

  return orders.value.filter((entry) => {
    const deliveryStatus = entry.delivery?.status ?? "scheduled";
    const isCompleted =
      entry.status === "completed" || deliveryStatus === "delivered";

    if (props.scope === "assigned" && isCompleted) {
      return false;
    }

    if (props.scope === "completed" && !isCompleted) {
      return false;
    }

    if (status.value !== "all" && deliveryStatus !== status.value) {
      return false;
    }

    if (!orderSearch) {
      return true;
    }

    return (
      entry.id.toLowerCase().includes(orderSearch) ||
      entry.delivery?.id?.toLowerCase().includes(orderSearch) ||
      entry.delivery?.vehicle_number?.toLowerCase().includes(orderSearch) ||
      ""
    );
  });
});

const statusOptions = [
  { label: "All deliveries", value: "all" },
  { label: "Scheduled", value: "scheduled" },
  { label: "In transit", value: "in_transit" },
  { label: "Delivered", value: "delivered" },
  { label: "Failed", value: "failed" },
  { label: "Cancelled", value: "cancelled" },
];

const pageTitle = computed(() =>
  props.scope === "assigned" ? "Assigned Jobs" : "Completed Jobs",
);

const pageDescription = computed(() =>
  props.scope === "assigned"
    ? "Review your assigned delivery jobs and mark them as delivered when the drop-off is complete."
    : "Keep track of the orders you have already completed.",
);

const sectionEyebrow = computed(() =>
  props.scope === "assigned" ? "Driver Delivery Queue" : "Delivery History",
);

const loadDriverContext = async () => {
  if (account.value?.driver?.id) {
    return true;
  }

  const response = await accountStore.fetchAccount();

  if (response.status === "error") {
    pageError.value =
      response.message || "Your driver profile could not be loaded.";
    return false;
  }

  if (!accountStore.account?.driver?.id) {
    pageError.value =
      "This account is missing a linked driver profile, so assigned jobs cannot be loaded.";
    return false;
  }

  return true;
};

const loadPage = async () => {
  pageError.value = null;

  if (!(await loadDriverContext()) || !driver.value?.id) {
    return;
  }

  const response = await driverOrdersStore.fetchDriverOrders(driver.value.id, {
    q: search.value,
    page: 1,
  });

  if (response.status === "error") {
    pageError.value =
      response.message || "Assigned driver jobs could not be loaded right now.";
  }
};

await loadPage();

const handleSearch = async (value: string) => {
  search.value = value;
  await loadPage();
};

const handleStatus = (value: string) => {
  status.value = value;
};

const handleRetry = async () => {
  isRetrying.value = true;
  await loadPage();
  isRetrying.value = false;
};
</script>

<template>
  <div class="space-y-6">
    <UCard class="rounded-sm border border-slate-200/70 bg-white shadow-sm">
      <div
        class="flex flex-col gap-4 md:flex-row md:items-center md:justify-between"
      >
        <div>
          <p class="text-xs uppercase tracking-[0.22em] text-amber-600">
            {{ sectionEyebrow }}
          </p>
          <h1 class="mt-3 text-3xl font-semibold tracking-tight text-slate-900">
            {{ pageTitle }}
          </h1>
          <p class="mt-3 max-w-3xl text-sm leading-7 text-slate-600">
            {{ pageDescription }}
          </p>
        </div>

        <div class="grid gap-3 sm:grid-cols-2">
          <div class="rounded-2xl bg-slate-50 px-4 py-3">
            <p class="text-xs uppercase tracking-[0.18em] text-slate-500">
              Visible jobs
            </p>
            <p class="mt-2 text-2xl font-semibold text-slate-900">
              {{ filteredOrders.length }}
            </p>
          </div>

          <div class="rounded-2xl bg-slate-50 px-4 py-3">
            <p class="text-xs uppercase tracking-[0.18em] text-slate-500">
              Driver
            </p>
            <p class="mt-2 text-base font-semibold text-slate-900">
              {{ driver?.name ?? "Driver account" }}
            </p>
          </div>
        </div>
      </div>
    </UCard>

    <AdminPageStateCard
      v-if="pageError"
      :eyebrow="pageTitle"
      :title="`${pageTitle} unavailable`"
      :description="pageError"
      tone="error"
      action-label="Retry"
      :action-loading="isRetrying"
      @action="handleRetry"
    />

    <template v-else>
      <DriverDeliveriesFilters
        :search="search"
        :status="status"
        :status-options="statusOptions"
        @update:search="handleSearch"
        @update:status="handleStatus"
      />

      <DriverDeliveriesTable
        :orders="filteredOrders"
        :is-loading="isLoading"
        :scope="props.scope"
        :driver-id="driver?.id ?? ''"
        @updated="loadPage"
      />
    </template>
  </div>
</template>
