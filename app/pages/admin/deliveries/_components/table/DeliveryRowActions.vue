<script setup lang="ts">
import type { Delivery } from "~/types/delivery";
import type { Driver } from "~/types/driver";
import { useModal } from "~/composables/admin/useModal";
import AdminActionMenu from "../../../_components/AdminActionMenu.vue";
import type {
  AdminActionItem,
  AdminActionSection,
} from "../../../_components/admin-table";
import DeliveryAssignDriverModal from "../modals/DeliveryAssignDriverModal.vue";
import DeliveryEditModal from "../modals/DeliveryEditModal.vue";
import OrderProductsModal from "../../../orders/_components/modals/OrderProductsModal.vue";

const props = defineProps<{
  delivery: Delivery;
  drivers: Driver[];
  detailBasePath: string;
}>();

const { openModal } = useModal();
const deliveryId = computed(() => props.delivery.id);

const viewActions = computed<AdminActionItem[]>(() => [
  {
    label: "View Delivery Details",
    icon: "i-lucide-eye",
    to: `${props.detailBasePath}/${deliveryId.value}`,
  },
  {
    label: "View Products",
    icon: "i-lucide-package",
    onClick: () =>
      openModal(OrderProductsModal, {
        orderId: props.delivery.order_id,
        eyebrow: "Delivery Products",
        title: "Products in this delivery",
        description:
          "Review the products and quantities linked to the order behind this delivery.",
      }),
  },
]);

const editActions = computed<AdminActionItem[]>(() => [
  {
    label: props.delivery.driver_id ? "Reassign Driver" : "Assign Driver",
    icon: "i-lucide-user-round-plus",
    color: "primary",
    onClick: () =>
      openModal(DeliveryAssignDriverModal, {
        delivery: props.delivery,
        drivers: props.drivers,
      }),
  },
  {
    label: "Update Delivery",
    icon: "i-lucide-pencil",
    onClick: () =>
      openModal(DeliveryEditModal, {
        delivery: props.delivery,
        drivers: props.drivers,
      }),
  },
]);

const sections = computed<AdminActionSection[]>(() => [
  { label: "View / Info", actions: viewActions.value },
  { label: "Edit / Update", actions: editActions.value },
]);
</script>

<template>
  <AdminActionMenu :sections="sections" />
</template>
