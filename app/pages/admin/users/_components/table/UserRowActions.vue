<script setup lang="ts">
import type { User } from "~/types/user";
import { useModal } from "~/composables/admin/useModal";
import AdminActionMenu from "../../../_components/AdminActionMenu.vue";
import type {
  AdminActionItem,
  AdminActionSection,
} from "../../../_components/admin-table";
import UserDeleteModal from "../modals/UserDeleteModal.vue";
import UserEditModal from "../modals/UserEditModal.vue";
import UserStatusModal from "../modals/UserStatusModal.vue";

const props = defineProps<{
  user: User;
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
        to: `/admin/users/${props.user.id}`,
      },
    ],
  },
  {
    label: "Manage",
    actions: authStore.hasAnyRole(["admin"])
      ? [
          {
            label: "Edit account",
            icon: "i-lucide-pencil-line",
            onClick: () => openModal(UserEditModal, props.user),
          },
          {
            label: props.user.is_active ? "Deactivate account" : "Activate account",
            icon: props.user.is_active
              ? "i-lucide-user-x"
              : "i-lucide-user-check",
            color: props.user.is_active ? "warning" : "success",
            onClick: () => openModal(UserStatusModal, props.user),
          },
        ]
      : [],
  },
  {
    label: "Danger zone",
    actions: authStore.hasAnyRole(["admin"])
      ? [
          {
            label: "Delete account",
            icon: "i-lucide-trash-2",
            color: "error",
            onClick: () => openModal(UserDeleteModal, props.user),
          },
        ]
      : [],
  },
]);
</script>

<template>
  <AdminActionMenu :sections="sections" />
</template>
