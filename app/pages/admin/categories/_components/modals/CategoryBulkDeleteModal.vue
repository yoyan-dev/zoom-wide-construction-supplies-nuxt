<script setup lang="ts">
import ActionConfirmModal from "~/pages/admin/_components/modals/ActionConfirmModal.vue";
import { useAdminDeleteFeedback } from "~/composables/admin/useAdminDeleteFeedback";

const props = defineProps<{
  payload: { ids: string[]; onDeleted?: () => void } | null;
}>();

const emit = defineEmits<{ close: [boolean] }>();

const categoryStore = useCategoryStore();
const { getBulkDeleteDescription, handleBulkDelete } = useAdminDeleteFeedback();

const count = computed(() => props.payload?.ids?.length ?? 0);

const payload = computed(() => ({
  eyebrow: "Delete Categories",
  title: `Delete ${count.value} selected categories?`,
  description: getBulkDeleteDescription("Categories"),
  confirmLabel: "Delete",
  confirmColor: "error" as const,
  onConfirm: async () => {
    if (!props.payload?.ids?.length) return false;

    return handleBulkDelete({
      ids: props.payload.ids,
      deleteItem: categoryStore.deleteCategory,
      resourceLabel: "Category",
      resourceLabelPlural: "Categories",
      onDeleted: props.payload.onDeleted,
    });
  },
}));
</script>

<template>
  <ActionConfirmModal :payload="payload" @close="emit('close', $event)" />
</template>
