<script setup lang="ts">
import { storeToRefs } from "pinia";
import AdminPageStateCard from "../../_components/AdminPageStateCard.vue";
import CustomersFilters from "./CustomersFilters.vue";
import CustomerHeader from "./table/CustomerHeader.vue";
import CustomersTable from "./table/CustomersTable.vue";
import AddCustomerModal from "./modals/AddCustomerModal.vue";
import {
  getCustomerTypeEmptyDescription,
  matchesCustomerType,
} from "./customer-options";
import type { CustomerType } from "~/types/customer";
import { useAdminPageLoadState } from "~/composables/admin/useAdminPageLoadState";
import { useModal } from "~/composables/admin/useModal";

const props = defineProps<{
  detailBasePath: string;
  customerType: CustomerType;
}>();

const customerStore = useCustomerStore();
const { openModal } = useModal();
const { getLoadErrorMessage } = useAdminPageLoadState();
const pageError = ref<string | null>(null);
const isRetrying = ref(false);

const loadPage = async () => {
  const customersResponse = await customerStore.fetchCustomers({
    customer_type: props.customerType,
  });

  pageError.value =
    customersResponse.status === "success"
      ? null
      : getLoadErrorMessage(
          [customersResponse],
          "The customers list could not be loaded right now.",
        );
};

await loadPage();

const { customers, totalCustomers, query, pagination, isLoading } =
  storeToRefs(customerStore);
const search = computed(() => query.value.q ?? "");
const typedCustomers = computed(() =>
  customers.value.filter((customer) =>
    matchesCustomerType(customer, props.customerType),
  ),
);
const totalTypedCustomers = computed(() => typedCustomers.value.length);
const accountStatus = ref("all");
const accountOptions = [
  { label: `All ${props.customerType}s`, value: "all" },
  { label: "Linked accounts", value: "linked" },
  { label: `Unlinked ${props.customerType}s`, value: "unlinked" },
];

const handleSearch = async (value: string) => {
  await customerStore.fetchCustomers({
    q: value,
    page: 1,
    customer_type: props.customerType,
  });
};

const handleAccountStatus = (value: string) => {
  accountStatus.value = value;
  void customerStore.fetchCustomers({
    q: search.value,
    page: 1,
    customer_type: props.customerType,
  });
};

const handlePageChange = async (page: number) => {
  await customerStore.fetchCustomers({
    q: search.value,
    page,
    customer_type: props.customerType,
  });
};

const handleCreate = () => {
  void openModal(AddCustomerModal, { customerType: props.customerType });
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
      <CustomerHeader
        :total="totalTypedCustomers"
        :customer-type="props.customerType"
        @create="handleCreate"
      />
      <template v-if="pageError">
        <AdminPageStateCard
          :eyebrow="props.customerType === 'contractor' ? 'Contractors' : 'Customers'"
          :title="props.customerType === 'contractor' ? 'Contractors unavailable' : 'Customers unavailable'"
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
          :customers="typedCustomers"
          :search="search"
          :account-status="accountStatus"
          :is-loading="isLoading"
          :detail-base-path="props.detailBasePath"
          :pagination="pagination"
          :customer-type="props.customerType"
          :empty-base-description="getCustomerTypeEmptyDescription(props.customerType)"
          @page-change="handlePageChange"
        />
      </template>
    </div>
  </div>
</template>
