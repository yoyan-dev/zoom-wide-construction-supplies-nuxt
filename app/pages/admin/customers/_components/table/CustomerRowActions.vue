<script setup lang="ts">
import type { Customer } from "~/types/customer";
import { useModal } from "~/composables/admin/useModal";
import AdminActionMenu from "../../../_components/AdminActionMenu.vue";
import type {
  AdminActionItem,
  AdminActionSection,
} from "../../../_components/admin-table";
import CustomerEditModal from "../modals/CustomerEditModal.vue";
import CustomerDeleteModal from "../modals/CustomerDeleteModal.vue";

const props = defineProps<{
  customer: Customer;
}>();

const { openModal } = useModal();
const customerId = computed(() => props.customer.id);

const viewActions = computed<AdminActionItem[]>(() => [
  {
    label: "View Customer Details",
    icon: "i-lucide-eye",
    to: `/admin/customers/${customerId.value}`,
  },
]);

const editActions = computed<AdminActionItem[]>(() => [
  {
    label: "Edit Customer",
    icon: "i-lucide-pencil",
    onClick: () => openModal(CustomerEditModal, props.customer),
  },
]);

const adminActions = computed<AdminActionItem[]>(() => [
  {
    label: "Delete Customer",
    icon: "i-lucide-trash",
    color: "error",
    onClick: () => openModal(CustomerDeleteModal, props.customer),
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
