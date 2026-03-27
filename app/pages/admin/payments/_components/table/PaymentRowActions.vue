<script setup lang="ts">
import AdminActionMenu from "../../../_components/AdminActionMenu.vue";
import type {
  AdminActionItem,
  AdminActionSection,
} from "../../../_components/admin-table";

const props = defineProps<{
  paymentId: string;
  detailBasePath: string;
  orderId?: string;
  orderBasePath?: string;
}>();

const viewActions = computed<AdminActionItem[]>(() => [
  {
    label: "View Payment Details",
    icon: "i-lucide-eye",
    to: `${props.detailBasePath}/${props.paymentId}`,
  },
  ...(props.orderBasePath && props.orderId
    ? [
        {
          label: "View Related Order",
          icon: "i-lucide-package-search",
          to: `${props.orderBasePath}/${props.orderId}`,
        } satisfies AdminActionItem,
      ]
    : []),
]);

const sections = computed<AdminActionSection[]>(() => [
  { label: "View / Info", actions: viewActions.value },
]);
</script>

<template>
  <AdminActionMenu :sections="sections" />
</template>
