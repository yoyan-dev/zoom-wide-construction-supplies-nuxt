<script setup lang="ts">
import type { Warehouse } from "~/types/warehouse";
import { useModal } from "~/composables/admin/useModal";
import AdminActionMenu from "../../../_components/AdminActionMenu.vue";
import type { AdminActionSection } from "../../../_components/admin-table";
import WarehouseDeleteModal from "../modals/WarehouseDeleteModal.vue";
import WarehouseEditModal from "../modals/WarehouseEditModal.vue";
import WarehouseStatusModal from "../modals/WarehouseStatusModal.vue";

const props = defineProps<{
  warehouse: Warehouse;
}>();

const authStore = useAuthStore();
const { openModal } = useModal();

const sections = computed<AdminActionSection[]>(() => [
  {
    label: "View",
    actions: [
      {
        label: "Open details",
        icon: "i-lucide-arrow-up-right",
        to: `/admin/warehouses/${props.warehouse.id}`,
      },
    ],
  },
  {
    label: "Manage",
    actions: authStore.hasAnyRole(["admin", "warehouse_manager"])
      ? [
          {
            label: "Edit warehouse",
            icon: "i-lucide-pencil-line",
            onClick: () => openModal(WarehouseEditModal, props.warehouse),
          },
          {
            label:
              props.warehouse.status === "active"
                ? "Deactivate warehouse"
                : "Activate warehouse",
            icon:
              props.warehouse.status === "active"
                ? "i-lucide-archive"
                : "i-lucide-circle-check",
            color: props.warehouse.status === "active" ? "warning" : "success",
            onClick: () => openModal(WarehouseStatusModal, props.warehouse),
          },
        ]
      : [],
  },
  {
    label: "Danger zone",
    actions: authStore.hasAnyRole(["admin", "warehouse_manager"])
      ? [
          {
            label: "Delete warehouse",
            icon: "i-lucide-trash-2",
            color: "error",
            onClick: () => openModal(WarehouseDeleteModal, props.warehouse),
          },
        ]
      : [],
  },
]);
</script>

<template>
  <AdminActionMenu :sections="sections" />
</template>
