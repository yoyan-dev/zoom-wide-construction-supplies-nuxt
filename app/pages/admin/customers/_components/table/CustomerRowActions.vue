<script setup lang="ts">
import type { Customer } from "~/types/customer";
import AdminActionMenu from "../../../_components/AdminActionMenu.vue";
import type {
  AdminActionItem,
  AdminActionSection,
} from "../../../_components/admin-table";

const props = defineProps<{
  customer: Customer;
}>();

const customerId = computed(() => props.customer.id);

const viewActions = computed<AdminActionItem[]>(() => [
  {
    label: "View Customer Details",
    icon: "i-lucide-eye",
    to: `/admin/customers/${customerId.value}`,
  },
]);

const sections = computed<AdminActionSection[]>(() => [
  { label: "View / Info", actions: viewActions.value },
]);
</script>

<template>
  <AdminActionMenu :sections="sections" />
</template>
