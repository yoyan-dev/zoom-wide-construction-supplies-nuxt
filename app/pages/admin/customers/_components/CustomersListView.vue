<script setup lang="ts">
import { storeToRefs } from "pinia";
import AdminPageStateCard from "../../_components/AdminPageStateCard.vue";
import CustomersFilters from "./CustomersFilters.vue";
import CustomerHeader from "./table/CustomerHeader.vue";
import CustomersTable from "./table/CustomersTable.vue";
import AddCustomerModal from "./modals/AddCustomerModal.vue";
import { useAdminPageLoadState } from "~/composables/admin/useAdminPageLoadState";
import { useModal } from "~/composables/admin/useModal";

const props = defineProps<{
  detailBasePath: string;
}>();

const customerStore = useCustomerStore();
const { openModal } = useModal();
const { getLoadErrorMessage } = useAdminPageLoadState();
const pageError = ref<string | null>(null);
const isRetrying = ref(false);

const loadPage = async () => {
  const customersResponse = await customerStore.fetchCustomers();

  pageError.value =
    customersResponse.status === "success"
      ? null
      : getLoadErrorMessage(
          [customersResponse],
          "The customers list could not be loaded right now.",
        );
};

await loadPage();

const { customers, query, isLoading } = storeToRefs(customerStore);
const search = computed(() => query.value.q ?? "");
const accountStatus = ref("all");
const accountOptions = [
  { label: "All customers", value: "all" },
  { label: "Linked accounts", value: "linked" },
  { label: "Unlinked customers", value: "unlinked" },
];

const handleSearch = async (value: string) => {
  await customerStore.fetchCustomers({
    q: value,
    page: 1,
  });
};

const handleAccountStatus = (value: string) => {
  accountStatus.value = value;
};

const handleCreate = () => {
  void openModal(AddCustomerModal);
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
      <CustomerHeader :total="customers.length" @create="handleCreate" />
      <template v-if="pageError">
        <AdminPageStateCard
          eyebrow="Customers"
          title="Customers unavailable"
          :description="pageError"
          tone="error"
          action-label="Retry"
          :action-loading="isRetrying"
          @action="handleRetry"
        />
      </template>
      <template v-else>
        <CustomersFilters
          :search="search"
          :account-status="accountStatus"
          :account-options="accountOptions"
          @update:search="handleSearch"
          @update:account-status="handleAccountStatus"
        />
        <CustomersTable
          :customers="customers"
          :search="search"
          :account-status="accountStatus"
          :is-loading="isLoading"
          :detail-base-path="props.detailBasePath"
        />
      </template>
    </div>
  </div>
</template>
