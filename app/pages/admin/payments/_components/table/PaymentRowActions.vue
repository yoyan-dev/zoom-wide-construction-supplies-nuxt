<script setup lang="ts">
import type { Payment } from "~/types/payment";
import { useModal } from "~/composables/admin/useModal";
import AdminActionMenu from "../../../_components/AdminActionMenu.vue";
import type {
  AdminActionItem,
  AdminActionSection,
} from "../../../_components/admin-table";
import PaymentEditModal from "../modals/PaymentEditModal.vue";

const props = defineProps<{
  payment: Payment;
  detailBasePath: string;
  orderBasePath?: string;
}>();

const authStore = useAuthStore();
const { openModal } = useModal();
const viewActions = computed<AdminActionItem[]>(() => [
  {
    label: "View Payment Details",
    icon: "i-lucide-eye",
    to: `${props.detailBasePath}/${props.payment.id}`,
  },
  ...(props.orderBasePath && props.payment.order_id
    ? [
        {
          label: "View Related Order",
          icon: "i-lucide-package-search",
          to: `${props.orderBasePath}/${props.payment.order_id}`,
        } satisfies AdminActionItem,
      ]
    : []),
]);

const editActions = computed<AdminActionItem[]>(() => [
  ...(authStore.hasAnyRole(["admin", "finance"])
    ? [
        {
          label: "Update Payment",
          icon: "i-lucide-pencil",
          onClick: () => openModal(PaymentEditModal, props.payment),
        } satisfies AdminActionItem,
      ]
    : []),
]);

const sections = computed<AdminActionSection[]>(() => [
  { label: "View / Info", actions: viewActions.value },
  { label: "Edit / Update", actions: editActions.value },
]);
</script>

<template>
  <AdminActionMenu :sections="sections" />
</template>
