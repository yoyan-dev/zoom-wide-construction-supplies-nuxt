<script setup lang="ts">
import type { Order } from "~/types/order";
import { useModal } from "~/composables/admin/useModal";
import AdminActionMenu from "../../../_components/AdminActionMenu.vue";
import type {
  AdminActionItem,
  AdminActionSection,
} from "../../../_components/admin-table";
import OrderApproveModal from "../modals/OrderApproveModal.vue";
import OrderRejectModal from "../modals/OrderRejectModal.vue";

const props = defineProps<{
  order: Order;
  detailBasePath: string;
}>();

const { openModal } = useModal();
const orderId = computed(() => props.order.id);

const viewActions = computed<AdminActionItem[]>(() => [
  {
    label: "View Order Details",
    icon: "i-lucide-eye",
    to: `${props.detailBasePath}/${orderId.value}`,
  },
]);

const editActions = computed<AdminActionItem[]>(() => {
  if (props.order.status !== "pending") {
    return [];
  }

  return [
    {
      label: "Approve Order",
      icon: "i-lucide-badge-check",
      color: "success",
      onClick: () => openModal(OrderApproveModal, props.order),
    },
    {
      label: "Reject Order",
      icon: "i-lucide-circle-x",
      color: "error",
      onClick: () => openModal(OrderRejectModal, props.order),
    },
  ];
});

const sections = computed<AdminActionSection[]>(() => [
  { label: "View / Info", actions: viewActions.value },
  { label: "Edit / Update", actions: editActions.value },
]);
</script>

<template>
  <AdminActionMenu :sections="sections" />
</template>
