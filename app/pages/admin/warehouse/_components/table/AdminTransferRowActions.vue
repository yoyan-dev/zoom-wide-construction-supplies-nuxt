<script setup lang="ts">
import type { WarehouseTransfer } from "~/types/warehouse-transfer";
import { useModal } from "~/composables/admin/useModal";
import ActionConfirmModal from "~/pages/admin/_components/modals/ActionConfirmModal.vue";
import TransferDetailsModal from "../modals/TransferDetailsModal.vue";

type ActionItem = {
  label: string;
  icon: string;
  color?: string;
  to?: string;
  onClick?: () => void | Promise<void>;
};

const props = defineProps<{
  transfer: WarehouseTransfer;
}>();

const { openModal } = useModal();
const transferStore = useWarehouseTransfersStore();

const openConfirm = (payload: {
  title: string;
  description?: string;
  confirmLabel?: string;
  confirmColor?: string;
  onConfirm: () => void | Promise<void>;
}) => openModal(ActionConfirmModal, payload);

const viewActions = computed<ActionItem[]>(() => [
  {
    label: "View Transfer",
    icon: "i-lucide-eye",
    onClick: () => openModal(TransferDetailsModal, props.transfer),
  },
]);

const statusActions = computed<ActionItem[]>(() => {
  const actions: ActionItem[] = [];
  if (props.transfer.status === "pending") {
    actions.push({
      label: "Approve Transfer",
      icon: "i-lucide-check-circle",
      onClick: () =>
        openConfirm({
          title: "Approve transfer",
          description: `Approve ${props.transfer.id}?`,
          confirmLabel: "Approve",
          confirmColor: "primary",
          onConfirm: () => transferStore.approveTransfer(props.transfer.id),
        }),
    });
  }

  if (props.transfer.status === "approved") {
    actions.push({
      label: "Mark In Transit",
      icon: "i-lucide-truck",
      onClick: () =>
        openConfirm({
          title: "Mark in transit",
          description: `Mark ${props.transfer.id} as in transit?`,
          confirmLabel: "Mark In Transit",
          confirmColor: "info",
          onConfirm: () => transferStore.markInTransit(props.transfer.id),
        }),
    });
  }

  if (props.transfer.status === "in_transit") {
    actions.push({
      label: "Mark Received",
      icon: "i-lucide-package-check",
      onClick: () =>
        openConfirm({
          title: "Mark received",
          description: `Mark ${props.transfer.id} as received?`,
          confirmLabel: "Mark Received",
          confirmColor: "success",
          onConfirm: () => transferStore.markReceived(props.transfer.id),
        }),
    });
  }

  if (!["received", "cancelled"].includes(props.transfer.status)) {
    actions.push({
      label: "Cancel Transfer",
      icon: "i-lucide-x-circle",
      color: "warning",
      onClick: () =>
        openConfirm({
          title: "Cancel transfer",
          description: `Cancel ${props.transfer.id}?`,
          confirmLabel: "Cancel",
          confirmColor: "warning",
          onConfirm: () => transferStore.cancelTransfer(props.transfer.id),
        }),
    });
  }

  return actions;
});

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

        <div class="flex flex-col gap-1" v-if="statusActions.length">
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
      </div>
    </template>
  </UPopover>
</template>
