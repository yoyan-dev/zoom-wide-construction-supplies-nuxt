<script setup lang="ts">
import type { Category } from "~/types/category";
import { useModal } from "~/composables/admin/useModal";
import AdminActionMenu from "../../../_components/AdminActionMenu.vue";
import type {
  AdminActionItem,
  AdminActionSection,
} from "../../../_components/admin-table";
import CategoryViewModal from "../modals/CategoryViewModal.vue";
import CategoryDeleteModal from "../modals/CategoryDeleteModal.vue";
import CategoryEditModal from "../modals/CategoryEditModal.vue";

const props = defineProps<{
  category: Category;
}>();

const { openModal } = useModal();
const categoryId = computed(() => props.category.id);

const viewActions = computed<AdminActionItem[]>(() => [
  {
    label: "View Category",
    icon: "i-lucide-eye",
    onClick: () => openModal(CategoryViewModal, props.category),
  },
]);

const editActions = computed<AdminActionItem[]>(() => [
  {
    label: "Edit Category",
    icon: "i-lucide-pencil",
    onClick: () => openModal(CategoryEditModal, props.category),
  },
]);

const adminActions = computed<AdminActionItem[]>(() => [
  {
    label: "Delete Category",
    icon: "i-lucide-trash",
    color: "error",
    onClick: () => openModal(CategoryDeleteModal, props.category),
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
