<script setup lang="ts">
import type { Product } from "~/types/product";
import { useModal } from "~/composables/admin/useModal";
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

const productId = computed(() => props.product.id ?? "");

const openAdjustStock = () => {
  if (!productId.value) return;
  openModal(StockAdjustmentModal, {
    productId: productId.value,
    mode: "in",
    title: "Adjust Stock",
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

const stockActions = computed<ActionItem[]>(() => [
  {
    label: "Adjust Stock",
    icon: "i-lucide-plus-circle",
    onClick: openAdjustStock,
  },
  {
    label: "Transfer Stock",
    icon: "i-lucide-repeat",
    onClick: openTransferStock,
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

      <div class="flex flex-col gap-3 min-w-56">
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
            Stock
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
      </div>
    </template>
  </UPopover>
</template>
