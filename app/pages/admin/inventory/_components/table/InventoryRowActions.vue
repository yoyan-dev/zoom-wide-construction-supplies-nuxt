<script setup lang="ts">
import type { Product } from "~/types/product";
import { useModal } from "~/composables/admin/useModal";
import AdminActionMenu from "../../../_components/AdminActionMenu.vue";
import type {
  AdminActionItem,
  AdminActionSection,
} from "../../../_components/admin-table";
import InventoryMovementModal from "../modals/InventoryMovementModal.vue";

const props = defineProps<{
  product: Product;
  detailBasePath: string;
  productBasePath?: string;
  onMovementSaved?: () => Promise<void> | void;
}>();

const { openModal } = useModal();
const viewActions = computed<AdminActionItem[]>(() => [
  {
    label: "View Inventory Details",
    icon: "i-lucide-eye",
    to: `${props.detailBasePath}/${props.product.id ?? ""}`,
  },
  ...(props.productBasePath && props.product.id
    ? [
        {
          label: "View Product Details",
          icon: "i-lucide-package",
          to: `${props.productBasePath}/${props.product.id}`,
        } satisfies AdminActionItem,
      ]
    : []),
]);

const editActions = computed<AdminActionItem[]>(() => [
  {
    label: "Record Movement",
    icon: "i-lucide-clipboard-plus",
    onClick: () =>
      openModal(InventoryMovementModal, {
        product: props.product,
        onSaved: props.onMovementSaved,
      }),
  },
]);

const sections = computed<AdminActionSection[]>(() => [
  { label: "View / Info", actions: viewActions.value },
  { label: "Edit / Update", actions: editActions.value },
]);
</script>

<template>
  <AdminActionMenu :sections="sections" />
</template>
