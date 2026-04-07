<script setup lang="ts">
import { storeToRefs } from "pinia";
import AdminPageStateCard from "../../../_components/AdminPageStateCard.vue";
import CustomerDeleteModal from "../modals/CustomerDeleteModal.vue";
import CustomerEditModal from "../modals/CustomerEditModal.vue";
import CustomerAccountCard from "./CustomerAccountCard.vue";
import CustomerAddressCard from "./CustomerAddressCard.vue";
import CustomerOrderSummaryCard from "./CustomerOrderSummaryCard.vue";
import CustomerOverviewCard from "./CustomerOverviewCard.vue";
import { useAdminPageLoadState } from "~/composables/admin/useAdminPageLoadState";
import { useModal } from "~/composables/admin/useModal";

const props = withDefaults(
  defineProps<{
    customerId: string;
    backTo?: string;
  }>(),
  {
    backTo: "/admin/customers",
  },
);

const customerStore = useCustomerStore();
const { getLoadErrorMessage, isMissingResourceResponse } =
  useAdminPageLoadState();
const { openModal } = useModal();
const router = useRouter();
const pageError = ref<string | null>(null);
const isMissingCustomer = ref(false);
const isRetrying = ref(false);

const loadPage = async () => {
  const customerResponse = await customerStore.fetchCustomerById(props.customerId);

  isMissingCustomer.value = isMissingResourceResponse(customerResponse);
  pageError.value =
    customerResponse.status === "error" && !isMissingCustomer.value
      ? getLoadErrorMessage(
          [customerResponse],
          "The customer record could not be loaded right now.",
        )
      : null;
};

await loadPage();

const { customer } = storeToRefs(customerStore);

const goBack = () => {
  void router.push(props.backTo);
};

const editCustomer = () => {
  if (!customer.value) return;
  void openModal(CustomerEditModal, customer.value);
};

const deleteCustomer = () => {
  if (!customer.value) return;
  void openModal(CustomerDeleteModal, customer.value);
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
              Customer Management
            </p>
            <h1 class="mt-2 text-2xl font-semibold">
              {{ customer?.company_name ?? "Customer not found" }}
            </h1>
            <p class="mt-2 text-sm text-slate-600">
              Review customer identity, contact details, linked account context,
              and address information.
            </p>
          </div>
          <div class="flex flex-wrap items-center gap-2">
            <UButton color="neutral" variant="outline" @click="goBack">
              Back to Customers
            </UButton>
            <UButton v-if="customer?.id" color="primary" @click="editCustomer">
              Edit Customer
            </UButton>
            <UButton
              v-if="customer?.id"
              color="error"
              variant="soft"
              @click="deleteCustomer"
            >
              Delete Customer
            </UButton>
          </div>
        </div>
      </section>

      <AdminPageStateCard
        v-if="pageError"
        eyebrow="Customer Details"
        title="Customer unavailable"
        :description="pageError"
        tone="error"
        action-label="Retry"
        :action-loading="isRetrying"
        @action="retryLoad"
      />

      <AdminPageStateCard
        v-else-if="isMissingCustomer || !customer"
        eyebrow="Customer Details"
        title="Customer not found"
        description="Check the URL or return to the customers list."
        action-label="Back to Customers"
        action-color="neutral"
        action-icon="i-lucide-arrow-left"
        @action="goBack"
      />

      <div v-else class="space-y-6">
        <div class="grid gap-6 xl:grid-cols-[minmax(0,1.2fr)_minmax(320px,0.9fr)]">
          <CustomerOverviewCard :customer="customer" />
          <CustomerAccountCard :customer="customer" />
        </div>

        <div class="grid gap-6 lg:grid-cols-2">
          <CustomerAddressCard
            title="Billing Address"
            description="Primary billing details currently stored for this customer."
            :address="customer.billing_address"
          />
          <CustomerAddressCard
            title="Shipping Address"
            description="Primary delivery destination currently stored for this customer."
            :address="customer.shipping_address"
          />
        </div>

        <CustomerOrderSummaryCard :customer="customer" />
      </div>
    </div>
  </div>
</template>
