<script setup lang="ts">
import type { Product } from "~/types/product";
import { useModal } from "~/composables/admin/useModal";
import ActionConfirmModal from "~/pages/admin/_components/modals/ActionConfirmModal.vue";
import ActionFormModal from "~/pages/admin/_components/modals/ActionFormModal.vue";
import AdminStockAdjustmentModal from "../modals/AdminStockAdjustmentModal.vue";
import AdminTransferModal from "../modals/AdminTransferModal.vue";

type ActionItem = {
  label: string;
  icon: string;
  color?: string;
  to?: string;
  onClick?: () => boolean | void | Promise<boolean | void>;
};

const props = defineProps<{
  product: Product;
  warehouse: string;
}>();

const { openModal } = useModal();
const { notifyResponse, showSuccess } = useAdminResponseToast();
const productStore = useProductStore();
const inventoryStore = useInventoryStore();

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
      return notifyResponse(
        await productStore.updateProduct(productId.value, {
          minimum_stock_quantity: Number(values.minimum_stock_quantity ?? 0),
        }),
        {
          successTitle: "Minimum stock alert updated",
          errorTitle: "Minimum stock alert not updated",
        },
      );
    },
  });
};

const openAdjustStock = (title: string, mode: "in" | "out") => {
  if (!productId.value) return;
  openModal(AdminStockAdjustmentModal, {
    productId: productId.value,
    mode,
    title,
    warehouse: props.warehouse,
  });
};

const openTransferStock = () => {
  if (!productId.value) return;
  openModal(AdminTransferModal, {
    productId: productId.value,
    sourceWarehouse: props.warehouse,
  });
};

const archiveItem = () => {
  if (!productId.value) return;
  openModal(ActionConfirmModal, {
    title: "Archive inventory item",
    description: `Archive ${props.product.name ?? productId.value}?`,
    confirmLabel: "Archive",
    confirmColor: "warning",
    onConfirm: () => {
      inventoryStore.setInventoryStatus(productId.value, "archived");
      productStore.setProductArchived(productId.value, true);
      showSuccess("Inventory item archived");
      return true;
    },
  });
};

const viewActions = computed<ActionItem[]>(() => [
  {
    label: "View Inventory Item",
    icon: "i-lucide-eye",
    to: `/admin/products/${productId.value}`,
  },
]);

const editActions = computed<ActionItem[]>(() => [
  {
    label: "Edit Inventory Record",
    icon: "i-lucide-pencil",
    to: `/admin/products/edit/${productId.value}`,
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
    label: "Transfer Stock",
    icon: "i-lucide-repeat",
    onClick: openTransferStock,
  },
  {
    label: "Set Minimum Stock Alert",
    icon: "i-lucide-bell",
    onClick: openMinimumStock,
  },
]);

const archiveActions = computed<ActionItem[]>(() => [
  {
    label: "Archive Inventory Item",
    icon: "i-lucide-archive",
    color: "warning",
    onClick: archiveItem,
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
            Archive
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
