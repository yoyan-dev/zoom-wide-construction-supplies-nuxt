<script setup lang="ts">
import type { Delivery } from "~/types/delivery";
import AdminActionMenu from "../../../_components/AdminActionMenu.vue";
import type {
  AdminActionItem,
  AdminActionSection,
} from "../../../_components/admin-table";

const props = defineProps<{
  delivery: Delivery;
  detailBasePath: string;
}>();

const deliveryId = computed(() => props.delivery.id);

const viewActions = computed<AdminActionItem[]>(() => [
  {
    label: "View Delivery Details",
    icon: "i-lucide-eye",
    to: `${props.detailBasePath}/${deliveryId.value}`,
  },
]);

const sections = computed<AdminActionSection[]>(() => [
  { label: "View / Info", actions: viewActions.value },
]);
</script>

<template>
  <AdminActionMenu :sections="sections" />
</template>
