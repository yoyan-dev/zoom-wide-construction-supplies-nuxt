<script setup lang="ts">
import type { Supplier } from "~/types/supplier";
import { useModal } from "~/composables/admin/useModal";
import AdminActionMenu from "../../../_components/AdminActionMenu.vue";
import type {
  AdminActionItem,
  AdminActionSection,
} from "../../../_components/admin-table";
import SupplierViewModal from "../modals/SupplierViewModal.vue";
import SupplierDeleteModal from "../modals/SupplierDeleteModal.vue";
import SupplierEditModal from "../modals/SupplierEditModal.vue";

const props = defineProps<{
  supplier: Supplier;
}>();

const { openModal } = useModal();

const viewActions = computed<AdminActionItem[]>(() => [
  {
    label: "View Supplier Details",
    icon: "i-lucide-clipboard",
    onClick: () => openModal(SupplierViewModal, props.supplier),
  },
]);

const editActions = computed<AdminActionItem[]>(() => [
  {
    label: "Edit Supplier",
    icon: "i-lucide-pencil",
    onClick: () => openModal(SupplierEditModal, props.supplier),
  },
]);

const adminActions = computed<AdminActionItem[]>(() => [
  {
    label: "Delete Supplier",
    icon: "i-lucide-trash",
    color: "error",
    onClick: () => openModal(SupplierDeleteModal, props.supplier),
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
