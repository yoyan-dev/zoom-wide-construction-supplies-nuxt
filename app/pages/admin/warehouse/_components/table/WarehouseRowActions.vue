<script setup lang="ts">
import type { Warehouse } from "~/types/warehouse";
import type { User } from "~/types/user";
import { useModal } from "~/composables/admin/useModal";
import ActionConfirmModal from "~/pages/admin/_components/modals/ActionConfirmModal.vue";
import WarehouseArchiveDeleteModal from "../modals/WarehouseArchiveDeleteModal.vue";
import WarehouseManagerModal from "../modals/WarehouseManagerModal.vue";

type ActionItem = {
  label: string;
  icon: string;
  color?: string;
  to?: string;
  onClick?: () => boolean | void | Promise<boolean | void>;
};

const props = defineProps<{
  warehouse: Warehouse;
  managers: User[];
}>();

const { openModal } = useModal();
const { notifyResponse } = useAdminResponseToast();
const warehouseStore = useWarehouseStore();

const warehouseId = computed(() => props.warehouse.id);

const openStatusModal = (nextStatus: "active" | "inactive") => {
  openModal(ActionConfirmModal, {
    title: nextStatus === "active" ? "Activate warehouse" : "Deactivate warehouse",
    description: `${nextStatus === "active" ? "Activate" : "Deactivate"} ${props.warehouse.name}?`,
    confirmLabel: nextStatus === "active" ? "Activate" : "Deactivate",
    confirmColor: nextStatus === "active" ? "primary" : "warning",
    onConfirm: async () =>
      notifyResponse(
        await warehouseStore.setWarehouseStatus(warehouseId.value, nextStatus),
        {
          successTitle:
            nextStatus === "active"
              ? "Warehouse activated"
              : "Warehouse deactivated",
          errorTitle:
            nextStatus === "active"
              ? "Warehouse not activated"
              : "Warehouse not deactivated",
        },
      ),
  });
};

const viewActions = computed<ActionItem[]>(() => [
  {
    label: "View Warehouse",
    icon: "i-lucide-eye",
    to: `/admin/warehouse/${warehouseId.value}`,
  },
]);

const editActions = computed<ActionItem[]>(() => [
  {
    label: "Edit Warehouse",
    icon: "i-lucide-pencil",
    to: `/admin/warehouse/edit/${warehouseId.value}`,
  },
]);

const assignActions = computed<ActionItem[]>(() => [
  {
    label: "Assign Warehouse Manager",
    icon: "i-lucide-user-check",
    onClick: () =>
      openModal(WarehouseManagerModal, {
        warehouse: props.warehouse,
        managers: props.managers,
      }),
  },
]);

const viewDataActions = computed<ActionItem[]>(() => [
  {
    label: "View Warehouse Inventory",
    icon: "i-lucide-package",
    to: `/admin/warehouse/inventory?warehouse=${warehouseId.value}`,
  },
  {
    label: "View Warehouse Transfers",
    icon: "i-lucide-repeat",
    to: `/admin/warehouse/transfers?warehouse=${warehouseId.value}`,
  },
]);

const statusActions = computed<ActionItem[]>(() => [
  {
    label:
      props.warehouse.status === "active"
        ? "Deactivate Warehouse"
        : "Activate Warehouse",
    icon:
      props.warehouse.status === "active"
        ? "i-lucide-toggle-right"
        : "i-lucide-toggle-left",
    onClick: () =>
      openStatusModal(props.warehouse.status === "active" ? "inactive" : "active"),
  },
]);

const archiveActions = computed<ActionItem[]>(() => [
  {
    label: "Archive / Delete Warehouse",
    icon: "i-lucide-archive",
    color: "warning",
    onClick: () => openModal(WarehouseArchiveDeleteModal, props.warehouse),
  },
]);

const handleAction = async (action: ActionItem, close: () => void) => {
  if (action.onClick) {
    const shouldClose = (await action.onClick()) !== false;

    if (!shouldClose) {
      return;
    }
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
            v-for="action in assignActions"
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
            Data Views
          </p>
          <UButton
            v-for="action in viewDataActions"
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
            Archive / Delete
          </p>
          <UButton
            v-for="action in archiveActions"
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
