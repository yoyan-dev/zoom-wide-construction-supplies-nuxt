<script setup lang="ts">
import type { Product } from "~/types/product";
import { useModal } from "~/composables/admin/useModal";
import AdminActionMenu from "../../../_components/AdminActionMenu.vue";
import type {
  AdminActionItem,
  AdminActionSection,
} from "../../../_components/admin-table";
import ProductDeleteModal from "../modals/ProductDeleteModal.vue";

const props = defineProps<{
  product: Product;
}>();

const { openModal } = useModal();
const productId = computed(() => props.product.id ?? "");

const viewActions = computed<AdminActionItem[]>(() => [
  {
    label: "View Product",
    icon: "i-lucide-eye",
    to: `/admin/products/${productId.value}`,
  },
]);

const editActions = computed<AdminActionItem[]>(() => [
  {
    label: "Edit Product",
    icon: "i-lucide-pencil",
    to: `/admin/products/edit/${productId.value}`,
  },
]);

const adminActions = computed<AdminActionItem[]>(() => [
  {
    label: "Delete Product",
    icon: "i-lucide-trash",
    color: "error",
    onClick: () => openModal(ProductDeleteModal, props.product),
  },
]);

const sections = computed<AdminActionSection[]>(() => [
  { label: "View / Info", actions: viewActions.value },
  { label: "Edit / Update", actions: editActions.value },
  { label: "Admin / Delete / Duplicate", actions: adminActions.value },
]);
</script>

<template>
  <AdminActionMenu :sections="sections" />
</template>
