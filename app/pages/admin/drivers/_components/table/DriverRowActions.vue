<script setup lang="ts">
import type { Driver } from "~/types/driver";
import { useModal } from "~/composables/admin/useModal";
import AdminActionMenu from "../../../_components/AdminActionMenu.vue";
import type { AdminActionSection } from "../../../_components/admin-table";
import DriverDeleteModal from "../modals/DriverDeleteModal.vue";
import DriverEditModal from "../modals/DriverEditModal.vue";
import DriverStatusModal from "../modals/DriverStatusModal.vue";

const props = defineProps<{
  driver: Driver;
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
        to: `/admin/drivers/${props.driver.id}`,
      },
    ],
  },
  {
    label: "Manage",
    actions: authStore.hasAnyRole(["admin"])
      ? [
          {
            label: "Edit driver",
            icon: "i-lucide-pencil-line",
            onClick: () => openModal(DriverEditModal, props.driver),
          },
          {
            label:
              props.driver.is_active === false
                ? "Activate driver"
                : "Deactivate driver",
            icon:
              props.driver.is_active === false
                ? "i-lucide-user-check"
                : "i-lucide-user-x",
            color: props.driver.is_active === false ? "success" : "warning",
            onClick: () => openModal(DriverStatusModal, props.driver),
          },
        ]
      : [],
  },
  {
    label: "Danger zone",
    actions: authStore.hasAnyRole(["admin"])
      ? [
          {
            label: "Delete driver",
            icon: "i-lucide-trash-2",
            color: "error",
            onClick: () => openModal(DriverDeleteModal, props.driver),
          },
        ]
      : [],
  },
]);
</script>

<template>
  <AdminActionMenu :sections="sections" />
</template>
