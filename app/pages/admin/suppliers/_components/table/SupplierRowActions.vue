<script setup lang="ts">
import type { Supplier } from "~/types/supplier";
import { useModal } from "~/composables/admin/useModal";
import AdminActionMenu from "../../../_components/AdminActionMenu.vue";
import type { AdminActionSection } from "../../../_components/admin-table";
import SupplierDeleteModal from "../modals/SupplierDeleteModal.vue";
import SupplierEditModal from "../modals/SupplierEditModal.vue";
import SupplierStatusModal from "../modals/SupplierStatusModal.vue";

const props = defineProps<{
  supplier: Supplier;
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
        to: `/admin/suppliers/${props.supplier.id}`,
      },
    ],
  },
  {
    label: "Manage",
    actions: authStore.hasAnyRole(["admin"])
      ? [
          {
            label: "Edit supplier",
            icon: "i-lucide-pencil-line",
            onClick: () => openModal(SupplierEditModal, props.supplier),
          },
          {
            label:
              props.supplier.is_active === false
                ? "Activate supplier"
                : "Deactivate supplier",
            icon:
              props.supplier.is_active === false
                ? "i-lucide-user-check"
                : "i-lucide-user-x",
            color:
              props.supplier.is_active === false ? "success" : "warning",
            onClick: () => openModal(SupplierStatusModal, props.supplier),
          },
        ]
      : [],
  },
  {
    label: "Danger zone",
    actions: authStore.hasAnyRole(["admin"])
      ? [
          {
            label: "Delete supplier",
            icon: "i-lucide-trash-2",
            color: "error",
            onClick: () => openModal(SupplierDeleteModal, props.supplier),
          },
        ]
      : [],
  },
]);
</script>

<template>
  <AdminActionMenu :sections="sections" />
</template>
