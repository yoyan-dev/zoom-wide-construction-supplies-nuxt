<script setup lang="ts">
import ActionConfirmModal from "~/pages/admin/_components/modals/ActionConfirmModal.vue";
import { useAdminDeleteFeedback } from "~/composables/admin/useAdminDeleteFeedback";
import type { Category } from "~/types/category";

const props = defineProps<{
  payload: Category | null;
}>();

const categoryStore = useCategoryStore();
const { getSingleDeleteDescription, handleSingleDelete } =
  useAdminDeleteFeedback();
const emit = defineEmits<{ close: [boolean] }>();

const payload = computed(() => ({
  eyebrow: "Delete Category",
  title: props.payload?.name ?? "Category",
  description: getSingleDeleteDescription("Category"),
  confirmLabel: "Delete",
  confirmColor: "error" as const,
  onConfirm: async () => {
    if (!props.payload?.id) return false;

    return handleSingleDelete(
      await categoryStore.deleteCategory(props.payload.id),
      {
        resourceLabel: "Category",
        subject: props.payload.name ?? "the category",
      },
    );
  },
}));
</script>

<template>
  <ActionConfirmModal :payload="payload" @close="emit('close', $event)" />
</template>
