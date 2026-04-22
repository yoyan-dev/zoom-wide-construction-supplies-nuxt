<script setup lang="ts">
import type { Customer, CustomerType } from "~/types/customer";
import { useModal } from "~/composables/admin/useModal";
import AdminActionMenu from "../../../_components/AdminActionMenu.vue";
import type {
  AdminActionItem,
  AdminActionSection,
} from "../../../_components/admin-table";
import { getCustomerTypeLabel } from "../customer-options";
import CustomerEditModal from "../modals/CustomerEditModal.vue";
import CustomerDeleteModal from "../modals/CustomerDeleteModal.vue";

const props = defineProps<{
  customer: Customer;
  detailBasePath: string;
  customerType: CustomerType;
}>();

const { openModal } = useModal();
const customerId = computed(() => props.customer.id);

const viewActions = computed<AdminActionItem[]>(() => [
  {
    label: `View ${getCustomerTypeLabel(props.customerType)} Details`,
    icon: "i-lucide-eye",
    to: `${props.detailBasePath}/${customerId.value}`,
  },
]);

const editActions = computed<AdminActionItem[]>(() => [
  {
    label: `Edit ${getCustomerTypeLabel(props.customerType)}`,
    icon: "i-lucide-pencil",
    onClick: () =>
      openModal(CustomerEditModal, {
        customer: props.customer,
        customerType: props.customerType,
      }),
  },
]);

const adminActions = computed<AdminActionItem[]>(() => [
  {
    label: `Delete ${getCustomerTypeLabel(props.customerType)}`,
    icon: "i-lucide-trash",
    color: "error",
    onClick: () =>
      openModal(CustomerDeleteModal, {
        customer: props.customer,
        customerType: props.customerType,
      }),
  },
]);

const sections = computed<AdminActionSection[]>(() => [
  { label: "View / Info", actions: viewActions.value },
  { label: "Edit / Update", actions: editActions.value },
  { label: "Admin / Delete / Duplicate", actions: adminActions.value },
]);
</script>

<template>
  <AdminActionMenu :sections="sections" />
</template>
