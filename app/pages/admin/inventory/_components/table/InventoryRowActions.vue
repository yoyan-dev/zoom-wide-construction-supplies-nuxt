<script setup lang="ts">
import type { InventoryLog } from "~/types/inventory";
import { useModal } from "~/composables/admin/useModal";
import ActionConfirmModal from "../../../_components/modals/ActionConfirmModal.vue";
import ActionFormModal from "../../../_components/modals/ActionFormModal.vue";
import InventoryDeleteModal from "../modals/InventoryDeleteModal.vue";
import InventoryHistoryModal from "../modals/InventoryHistoryModal.vue";
import InventoryLocationModal from "../modals/InventoryLocationModal.vue";

type ActionItem = {
  label: string;
  icon: string;
  color?: string;
  to?: string;
  onClick?: () => void | Promise<void>;
};

const props = defineProps<{
  log: InventoryLog;
}>();

const { openModal } = useModal();
const inventoryStore = useInventoryStore();
const productStore = useProductStore();

const logId = computed(() => props.log.id);

const openConfirm = (payload: {
  title: string;
  description?: string;
  confirmLabel?: string;
  confirmColor?: string;
  onConfirm: () => Promise<void> | void;
}) => {
  openModal(ActionConfirmModal, payload);
};

const openForm = (payload: {
  title: string;
  description?: string;
  fields: Array<{
    key: string;
    label: string;
    type?: string;
    placeholder?: string;
    required?: boolean;
    value?: string | number;
  }>;
  confirmLabel?: string;
  confirmColor?: string;
  onSubmit: (values: Record<string, string | number>) => Promise<void> | void;
}) => {
  openModal(ActionFormModal, payload);
};

const openAdjustStock = (title: string, movementType: "in" | "out") => {
  openForm({
    title,
    confirmLabel: "Save",
    fields: [
      {
        key: "quantity",
        label: "Quantity",
        type: "number",
        placeholder: "0",
        required: true,
      },
      {
        key: "note",
        label: "Note",
        placeholder: "Reason for adjustment",
      },
    ],
    onSubmit: async (values) => {
      const quantity = Number(values.quantity ?? 0);
      if (!Number.isFinite(quantity) || quantity === 0) return;
      await inventoryStore.createInventoryLog({
        product_id: props.log.product_id,
        movement_type: movementType,
        quantity_change: quantity,
        reference_type: "manual",
        reference_id: props.log.reference_id ?? null,
        note: String(values.note ?? "") || null,
        created_by: "admin",
      });
      await productStore.adjustProductStock(
        props.log.product_id,
        movementType === "in" ? quantity : -quantity,
      );
    },
  });
};

const openTransferStock = () => {
  openForm({
    title: "Transfer Stock Between Locations",
    confirmLabel: "Transfer",
    fields: [
      {
        key: "quantity",
        label: "Quantity",
        type: "number",
        placeholder: "0",
        required: true,
      },
      {
        key: "from_location",
        label: "From location",
        placeholder: "Warehouse A",
      },
      {
        key: "to_location",
        label: "To location",
        placeholder: "Warehouse B",
      },
    ],
    onSubmit: async (values) => {
      const quantity = Number(values.quantity ?? 0);
      if (!Number.isFinite(quantity) || quantity === 0) return;
      const note = `Transfer ${values.from_location ?? ""} -> ${values.to_location ?? ""}`;

      await inventoryStore.createInventoryLog({
        product_id: props.log.product_id,
        movement_type: "out",
        quantity_change: quantity,
        reference_type: "transfer",
        reference_id: props.log.reference_id ?? null,
        note: note || null,
        created_by: "admin",
      });
      await inventoryStore.createInventoryLog({
        product_id: props.log.product_id,
        movement_type: "in",
        quantity_change: quantity,
        reference_type: "transfer",
        reference_id: props.log.reference_id ?? null,
        note: note || null,
        created_by: "admin",
      });
      if (values.to_location) {
        inventoryStore.updateInventoryLocation(logId.value, String(values.to_location));
      }
    },
  });
};

const openMinimumStock = () => {
  openForm({
    title: "Set Minimum Stock Alert",
    confirmLabel: "Save",
    fields: [
      {
        key: "minimum_stock_quantity",
        label: "Minimum stock",
        type: "number",
        placeholder: "0",
        required: true,
      },
    ],
    onSubmit: async (values) => {
      await productStore.updateProduct(props.log.product_id, {
        minimum_stock_quantity: Number(values.minimum_stock_quantity ?? 0),
      });
    },
  });
};

const viewActions = computed<ActionItem[]>(() => [
  {
    label: "View Inventory Item",
    icon: "i-lucide-eye",
    to: `/admin/inventory/${logId.value}`,
  },
  {
    label: "View Stock History / Movement",
    icon: "i-lucide-list",
    onClick: () => openModal(InventoryHistoryModal, props.log),
  },
  {
    label: "View Warehouse / Location Info",
    icon: "i-lucide-map-pin",
    onClick: () => openModal(InventoryLocationModal, props.log),
  },
]);

const editActions = computed<ActionItem[]>(() => [
  {
    label: "Edit Inventory Record",
    icon: "i-lucide-pencil",
    to: `/admin/inventory/edit/${logId.value}`,
  },
]);

const stockActions = computed<ActionItem[]>(() => [
  {
    label: "Add Stock",
    icon: "i-lucide-plus-circle",
    onClick: () => openAdjustStock("Add Stock", "in"),
  },
  {
    label: "Reduce Stock",
    icon: "i-lucide-minus-circle",
    onClick: () => openAdjustStock("Reduce Stock", "out"),
  },
  {
    label: "Transfer Stock Between Locations",
    icon: "i-lucide-swap",
    onClick: openTransferStock,
  },
  {
    label: "Set Minimum Stock Alert",
    icon: "i-lucide-bell",
    onClick: openMinimumStock,
  },
]);

const statusActions = computed<ActionItem[]>(() => [
  {
    label: "Mark as Available",
    icon: "i-lucide-check-circle",
    onClick: () => inventoryStore.setInventoryStatus(logId.value, "available"),
  },
  {
    label: "Mark as Unavailable",
    icon: "i-lucide-x-circle",
    onClick: () => inventoryStore.setInventoryStatus(logId.value, "unavailable"),
  },
  {
    label: "Archive Inventory Item",
    icon: "i-lucide-archive",
    onClick: () =>
      openConfirm({
        title: "Archive inventory item",
        description: `Archive ${props.log.product_id}?`,
        confirmLabel: "Archive",
        confirmColor: "warning",
        onConfirm: () => inventoryStore.setInventoryStatus(logId.value, "archived"),
      }),
  },
]);

const documentActions = computed<ActionItem[]>(() => [
  {
    label: "Export Inventory Data",
    icon: "i-lucide-file-export",
    onClick: () => inventoryStore.exportInventoryLog(logId.value),
  },
]);

const adminActions = computed<ActionItem[]>(() => [
  {
    label: "Delete Inventory Record",
    icon: "i-lucide-trash",
    color: "error",
    onClick: () => openModal(InventoryDeleteModal, props.log),
  },
  {
    label: "Duplicate Inventory Record",
    icon: "i-lucide-copy",
    onClick: () => inventoryStore.duplicateInventoryLog(logId.value),
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
            View / Info
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
            Edit / Update
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
            Inventory / Stock
          </p>
          <UButton
            v-for="action in stockActions"
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
            Status / Availability
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
            Documents / Export
          </p>
          <UButton
            v-for="action in documentActions"
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
            Admin / Delete / Duplicate
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
