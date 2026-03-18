<script setup lang="ts">
import type { User } from "~/types/user";
import { useModal } from "~/composables/admin/useModal";
import ActionConfirmModal from "~/pages/admin/_components/modals/ActionConfirmModal.vue";
import ActionFormModal from "~/pages/admin/_components/modals/ActionFormModal.vue";

type ActionItem = {
  label: string;
  icon: string;
  color?: string;
  to?: string;
  onClick?: () => void | Promise<void>;
};

const props = defineProps<{
  user: User;
  assignments: Record<string, string[]>;
  warehouseOptions: string[];
}>();

const { openModal } = useModal();
const warehouseUsersStore = useWarehouseUsersStore();

const assignedWarehouses = computed(
  () => props.assignments[props.user.id] ?? [],
);

const openAssignWarehouses = () => {
  openModal(ActionFormModal, {
    title: "Assign Warehouses",
    description:
      props.warehouseOptions.length > 0
        ? `Available: ${props.warehouseOptions.join(", ")}`
        : undefined,
    fields: [
      {
        key: "warehouses",
        label: "Warehouse names (comma separated)",
        placeholder: "Central Warehouse, East Storage",
        value: assignedWarehouses.value.join(", "),
        required: true,
      },
    ],
    confirmLabel: "Assign",
    onSubmit: async (values) => {
      const nextAssignments = String(values.warehouses ?? "")
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean);
      warehouseUsersStore.updateAssignments(props.user.id, nextAssignments);
    },
  });
};

const openManagePermissions = () => {
  openModal(ActionFormModal, {
    title: "Manage Permissions",
    description: "Update the staff role for this account.",
    fields: [
      {
        key: "role",
        label: "Role",
        placeholder: "warehouse_manager",
        value: props.user.role,
        required: true,
      },
    ],
    confirmLabel: "Update",
    onSubmit: async (values) => {
      await warehouseUsersStore.updateUser(props.user.id, {
        role: String(values.role ?? props.user.role),
      });
    },
  });
};

const openToggleStatus = () => {
  const nextActive = !props.user.is_active;
  openModal(ActionConfirmModal, {
    title: nextActive ? "Activate account" : "Deactivate account",
    description: `${nextActive ? "Activate" : "Deactivate"} ${props.user.full_name}?`,
    confirmLabel: nextActive ? "Activate" : "Deactivate",
    confirmColor: nextActive ? "primary" : "warning",
    onConfirm: () =>
      warehouseUsersStore.updateUser(props.user.id, {
        is_active: nextActive,
      }),
  });
};

const openDelete = () => {
  openModal(ActionConfirmModal, {
    title: "Delete account",
    description: `Delete ${props.user.full_name}? This cannot be undone.`,
    confirmLabel: "Delete",
    confirmColor: "error",
    onConfirm: () => warehouseUsersStore.deleteUser(props.user.id),
  });
};

const viewActions = computed<ActionItem[]>(() => [
  {
    label: "View User",
    icon: "i-lucide-eye",
    to: `/admin/warehouse/users/${props.user.id}`,
  },
]);

const editActions = computed<ActionItem[]>(() => [
  {
    label: "Edit User",
    icon: "i-lucide-pencil",
    to: `/admin/warehouse/users/edit/${props.user.id}`,
  },
]);

const assignmentActions = computed<ActionItem[]>(() => [
  {
    label: "Assign Warehouse",
    icon: "i-lucide-warehouse",
    onClick: openAssignWarehouses,
  },
]);

const accessActions = computed<ActionItem[]>(() => [
  {
    label: "Manage Permissions",
    icon: "i-lucide-shield",
    onClick: openManagePermissions,
  },
]);

const statusActions = computed<ActionItem[]>(() => [
  {
    label: props.user.is_active ? "Deactivate Account" : "Activate Account",
    icon: props.user.is_active ? "i-lucide-toggle-right" : "i-lucide-toggle-left",
    onClick: openToggleStatus,
  },
]);

const adminActions = computed<ActionItem[]>(() => [
  {
    label: "Delete Account",
    icon: "i-lucide-trash",
    color: "error",
    onClick: openDelete,
  },
]);

const handleAction = async (action: ActionItem, close: () => void) => {
  if (action.onClick) {
    await action.onClick();
  }
  close();
};
</script>

<template>
  <UPopover :dismissible="false" :ui="{ content: 'p-4' }">
    <UButton
      icon="i-lucide-ellipsis-vertical"
      variant="ghost"
      color="neutral"
      size="sm"
    />

    <template #content="{ close }">
      <div class="flex items-center justify-between gap-4 mb-4 w-full">
        <h2 class="text-highlighted font-semibold">Actions</h2>

        <UButton
          color="neutral"
          variant="ghost"
          icon="i-lucide-x"
          @click="close"
        />
      </div>

      <div class="flex flex-col gap-3 min-w-64">
        <div class="flex flex-col gap-1">
          <p class="px-2 text-xs uppercase tracking-[0.18em] text-slate-500">
            View
          </p>
          <UButton
            v-for="action in viewActions"
            :key="action.label"
            :icon="action.icon"
            :color="action.color ?? 'neutral'"
            variant="ghost"
            size="sm"
            class="w-full justify-start"
            :to="action.to"
            @click="handleAction(action, close)"
          >
            {{ action.label }}
          </UButton>
        </div>

        <UDivider />

        <div class="flex flex-col gap-1">
          <p class="px-2 text-xs uppercase tracking-[0.18em] text-slate-500">
            Edit
          </p>
          <UButton
            v-for="action in editActions"
            :key="action.label"
            :icon="action.icon"
            :color="action.color ?? 'neutral'"
            variant="ghost"
            size="sm"
            class="w-full justify-start"
            :to="action.to"
            @click="handleAction(action, close)"
          >
            {{ action.label }}
          </UButton>
        </div>

        <UDivider />

        <div class="flex flex-col gap-1">
          <p class="px-2 text-xs uppercase tracking-[0.18em] text-slate-500">
            Assignments
          </p>
          <UButton
            v-for="action in assignmentActions"
            :key="action.label"
            :icon="action.icon"
            :color="action.color ?? 'neutral'"
            variant="ghost"
            size="sm"
            class="w-full justify-start"
            :to="action.to"
            @click="handleAction(action, close)"
          >
            {{ action.label }}
          </UButton>
        </div>

        <UDivider />

        <div class="flex flex-col gap-1">
          <p class="px-2 text-xs uppercase tracking-[0.18em] text-slate-500">
            Access
          </p>
          <UButton
            v-for="action in accessActions"
            :key="action.label"
            :icon="action.icon"
            :color="action.color ?? 'neutral'"
            variant="ghost"
            size="sm"
            class="w-full justify-start"
            :to="action.to"
            @click="handleAction(action, close)"
          >
            {{ action.label }}
          </UButton>
        </div>

        <UDivider />

        <div class="flex flex-col gap-1">
          <p class="px-2 text-xs uppercase tracking-[0.18em] text-slate-500">
            Status
          </p>
          <UButton
            v-for="action in statusActions"
            :key="action.label"
            :icon="action.icon"
            :color="action.color ?? 'neutral'"
            variant="ghost"
            size="sm"
            class="w-full justify-start"
            :to="action.to"
            @click="handleAction(action, close)"
          >
            {{ action.label }}
          </UButton>
        </div>

        <UDivider />

        <div class="flex flex-col gap-1">
          <p class="px-2 text-xs uppercase tracking-[0.18em] text-slate-500">
            Admin
          </p>
          <UButton
            v-for="action in adminActions"
            :key="action.label"
            :icon="action.icon"
            :color="action.color ?? 'neutral'"
            variant="ghost"
            size="sm"
            class="w-full justify-start"
            :to="action.to"
            @click="handleAction(action, close)"
          >
            {{ action.label }}
          </UButton>
        </div>
      </div>
    </template>
  </UPopover>
</template>