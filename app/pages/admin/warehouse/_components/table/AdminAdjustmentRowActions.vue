<script setup lang="ts">
import type { InventoryLog } from "~/types/inventory";
import { useModal } from "~/composables/admin/useModal";
import ActionConfirmModal from "~/pages/admin/_components/modals/ActionConfirmModal.vue";
import AdjustmentDetailsModal from "../modals/AdjustmentDetailsModal.vue";

type ActionItem = {
  label: string;
  icon: string;
  color?: string;
  to?: string;
  onClick?: () => void | Promise<void>;
};

const props = defineProps<{
  log: InventoryLog;
  productName: string;
  warehouse: string;
}>();

const { openModal } = useModal();
const inventoryStore = useInventoryStore();
const productStore = useProductStore();

const normalizedDelta = (log: InventoryLog) => {
  if (log.movement_type === "in") return Math.abs(log.quantity_change);
  if (log.movement_type === "out") return -Math.abs(log.quantity_change);
  return log.quantity_change;
};

const openDetails = () => {
  openModal(AdjustmentDetailsModal, {
    log: props.log,
    productName: props.productName,
    warehouse: props.warehouse,
  });
};

const reverseAdjustment = () => {
  const reversalDelta = -normalizedDelta(props.log);
  openModal(ActionConfirmModal, {
    title: "Reverse adjustment",
    description: `Reverse ${props.log.id}? This will create a compensating entry.`,
    confirmLabel: "Reverse",
    confirmColor: "warning",
    onConfirm: async () => {
      await inventoryStore.createInventoryLog({
        product_id: props.log.product_id,
        movement_type: "adjustment",
        quantity_change: reversalDelta,
        reference_type: "adjustment",
        reference_id: null,
        note: `Reversal of ${props.log.id}`,
        created_by: "admin",
      });

      await productStore.adjustProductStock(props.log.product_id, reversalDelta);
    },
  });
};

const viewActions = computed<ActionItem[]>(() => [
  {
    label: "View Adjustment Details",
    icon: "i-lucide-eye",
    onClick: openDetails,
  },
]);

const exportActions = computed<ActionItem[]>(() => [
  {
    label: "Export Adjustment Record",
    icon: "i-lucide-file-down",
    onClick: () => inventoryStore.exportInventoryLog(props.log.id),
  },
]);

const adminActions = computed<ActionItem[]>(() => [
  {
    label: "Reverse Adjustment",
    icon: "i-lucide-rotate-ccw",
    color: "warning",
    onClick: reverseAdjustment,
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
            Records
          </p>
          <UButton
            v-for="action in exportActions"
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