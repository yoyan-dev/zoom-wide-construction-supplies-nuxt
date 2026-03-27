<script setup lang="ts">
import type { Delivery } from "~/types/delivery";
import type { Driver } from "~/types/driver";
import { useModal } from "~/composables/admin/useModal";
import AdminActionMenu from "../../../_components/AdminActionMenu.vue";
import type {
  AdminActionItem,
  AdminActionSection,
} from "../../../_components/admin-table";
import DeliveryEditModal from "../modals/DeliveryEditModal.vue";

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
]);

const editActions = computed<AdminActionItem[]>(() => [
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
