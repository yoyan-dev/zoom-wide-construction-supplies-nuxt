<script setup lang="ts">
import type { Product } from "~/types/product";
import { useModal } from "~/composables/admin/useModal";
import ActionFormModal from "~/pages/admin/_components/modals/ActionFormModal.vue";
import InventoryArchiveDeleteModal from "../modals/InventoryArchiveDeleteModal.vue";
import StockAdjustmentModal from "../modals/StockAdjustmentModal.vue";
import TransferStockModal from "../modals/TransferStockModal.vue";

type ActionItem = {
  label: string;
  icon: string;
  color?: string;
  to?: string;
  onClick?: () => void | Promise<void>;
};

const props = defineProps<{
  product: Product;
  warehouse: string;
}>();

const { openModal } = useModal();
const productStore = useProductStore();

const productId = computed(() => props.product.id ?? "");

const openMinimumStock = () => {
  if (!productId.value) return;
  openModal(ActionFormModal, {
    title: "Set Minimum Stock Alert",
    confirmLabel: "Save",
    fields: [
      {
        key: "minimum_stock_quantity",
        label: "Minimum stock",
        type: "number",
        placeholder: "0",
        value: props.product.minimum_stock_quantity ?? 0,
        required: true,
      },
    ],
    onSubmit: async (values) => {
      await productStore.updateProduct(productId.value, {
        minimum_stock_quantity: Number(values.minimum_stock_quantity ?? 0),
      });
    },
  });
};

const openAdjustStock = (title: string, mode: "in" | "out") => {
  if (!productId.value) return;
  openModal(StockAdjustmentModal, {
    productId: productId.value,
    mode,
    title,
  });
};

const openTransferStock = () => {
  if (!productId.value) return;
  openModal(TransferStockModal, {
    productId: productId.value,
    sourceWarehouse: props.warehouse,
  });
};

const viewActions = computed<ActionItem[]>(() => [
  {
    label: "View Inventory Item",
    icon: "i-lucide-eye",
    to: `/warehouse/inventory/${productId.value}`,
  },
]);

const editActions = computed<ActionItem[]>(() => [
  {
    label: "Edit Inventory Record",
    icon: "i-lucide-pencil",
    to: `/warehouse/inventory/edit/${productId.value}`,
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
    label: "Transfer Stock Between Warehouses",
    icon: "i-lucide-repeat",
    onClick: openTransferStock,
  },
]);

const alertActions = computed<ActionItem[]>(() => [
  {
    label: "Set Minimum Stock Alert",
    icon: "i-lucide-bell",
    onClick: openMinimumStock,
  },
]);

const archiveActions = computed<ActionItem[]>(() => [
  {
    label: "Archive / Delete Inventory Item",
    icon: "i-lucide-archive",
    color: "warning",
    onClick: () => openModal(InventoryArchiveDeleteModal, props.product),
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
            Stock Actions
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
            Alerts
          </p>
          <UButton
            v-for="action in alertActions"
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
