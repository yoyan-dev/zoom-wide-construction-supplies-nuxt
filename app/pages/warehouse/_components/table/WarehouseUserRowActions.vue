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
  warehouses: string[];
  onUpdateUser: (id: string, payload: Partial<User>) => void;
  onUpdateWarehouses: (id: string, warehouses: string[]) => void;
  onDelete: (id: string) => void;
}>();

const { openModal } = useModal();

const userId = computed(() => props.user.id);

const openAccessModal = () => {
  openModal(ActionFormModal, {
    title: "Manage Access / Permissions",
    confirmLabel: "Save",
    fields: [
      {
        key: "role",
        label: "Role",
        placeholder: "warehouse_manager",
        value: props.user.role,
        required: true,
      },
      {
        key: "warehouses",
        label: "Assigned warehouses",
        placeholder: "Central Warehouse, East Storage",
        value: props.warehouses.join(", "),
      },
    ],
    onSubmit: (values) => {
      props.onUpdateUser(userId.value, {
        role: String(values.role ?? props.user.role),
      });
      const nextWarehouses = String(values.warehouses ?? "")
        .split(",")
        .map((entry) => entry.trim())
        .filter(Boolean);
      props.onUpdateWarehouses(userId.value, nextWarehouses);
    },
  });
};

const openStatusModal = (nextActive: boolean) => {
  openModal(ActionConfirmModal, {
    title: nextActive ? "Activate account" : "Deactivate account",
    description: nextActive
      ? `Activate ${props.user.full_name}?`
      : `Deactivate ${props.user.full_name}?`,
    confirmLabel: nextActive ? "Activate" : "Deactivate",
    confirmColor: nextActive ? "primary" : "warning",
    onConfirm: () =>
      props.onUpdateUser(userId.value, {
        is_active: nextActive,
        updated_at: new Date().toISOString(),
      }),
  });
};

const openDeleteModal = () => {
  openModal(ActionConfirmModal, {
    title: "Delete account",
    description: `Delete ${props.user.full_name}? This cannot be undone.`,
    confirmLabel: "Delete",
    confirmColor: "error",
    onConfirm: () => props.onDelete(userId.value),
  });
};

const viewActions = computed<ActionItem[]>(() => [
  {
    label: "View Staff Account",
    icon: "i-lucide-eye",
    to: `/warehouse/users/${userId.value}`,
  },
]);

const editActions = computed<ActionItem[]>(() => [
  {
    label: "Edit Staff Info",
    icon: "i-lucide-pencil",
    to: `/warehouse/users/edit/${userId.value}`,
  },
]);

const accessActions = computed<ActionItem[]>(() => [
  {
    label: "Manage Access / Permissions",
    icon: "i-lucide-key",
    onClick: openAccessModal,
  },
]);

const statusActions = computed<ActionItem[]>(() => [
  {
    label: props.user.is_active ? "Deactivate Account" : "Activate Account",
    icon: props.user.is_active ? "i-lucide-user-x" : "i-lucide-user-check",
    onClick: () => openStatusModal(!props.user.is_active),
  },
]);

const dangerActions = computed<ActionItem[]>(() => [
  {
    label: "Delete Account",
    icon: "i-lucide-trash",
    color: "error",
    onClick: openDeleteModal,
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
            Danger
          </p>
          <UButton
            v-for="action in dangerActions"
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
