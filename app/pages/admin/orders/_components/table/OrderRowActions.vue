<script setup lang="ts">
import type { Order } from "~/types/order";
import AdminActionMenu from "../../../_components/AdminActionMenu.vue";
import type {
  AdminActionItem,
  AdminActionSection,
} from "../../../_components/admin-table";

const props = defineProps<{
  order: Order;
  detailBasePath: string;
}>();

const orderId = computed(() => props.order.id);

const viewActions = computed<AdminActionItem[]>(() => [
  {
    label: "View Order Details",
    icon: "i-lucide-eye",
    to: `${props.detailBasePath}/${orderId.value}`,
  },
]);

const sections = computed<AdminActionSection[]>(() => [
  { label: "View / Info", actions: viewActions.value },
]);
</script>

<template>
  <AdminActionMenu :sections="sections" />
</template>
