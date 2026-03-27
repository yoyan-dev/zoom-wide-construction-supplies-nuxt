<script setup lang="ts">
import AdminActionMenu from "../../../_components/AdminActionMenu.vue";
import type {
  AdminActionItem,
  AdminActionSection,
} from "../../../_components/admin-table";

const props = defineProps<{
  inventoryId: string;
  detailBasePath: string;
  productId?: string;
  productBasePath?: string;
}>();

const viewActions = computed<AdminActionItem[]>(() => [
  {
    label: "View Inventory Details",
    icon: "i-lucide-eye",
    to: `${props.detailBasePath}/${props.inventoryId}`,
  },
  ...(props.productBasePath && props.productId
    ? [
        {
          label: "View Product Details",
          icon: "i-lucide-package",
          to: `${props.productBasePath}/${props.productId}`,
        } satisfies AdminActionItem,
      ]
    : []),
]);

const sections = computed<AdminActionSection[]>(() => [
  { label: "View / Info", actions: viewActions.value },
]);
</script>

<template>
  <AdminActionMenu :sections="sections" />
</template>
