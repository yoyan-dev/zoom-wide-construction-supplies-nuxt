<script setup lang="ts">
import type { Category } from "~/types/category";

const props = defineProps<{
  payload: Category | null;
}>();

const category = ref<Category | null>(props.payload);
const categoryStore = useCategoryStore();
const { notifyResponse } = useAdminResponseToast();
const isDeleting = ref(false);
const emit = defineEmits<{ close: [boolean] }>();

const handleDelete = async () => {
  if (!category.value?.id) return;
  isDeleting.value = true;
  const response = await categoryStore.deleteCategory(category.value.id);
  isDeleting.value = false;

  if (
    !notifyResponse(response, {
      successTitle: "Category deleted",
      successDescription: `Removed ${category.value.name ?? "the category"}.`,
      errorTitle: "Category not deleted",
    })
  ) {
    return;
  }

  emit("close", false);
};
</script>

<template>
  <UModal :close="{ onClick: () => emit('close', false) }">
    <template #header>
      <div>
        <p class="text-xs uppercase tracking-[0.18em] text-slate-500">
          Delete Category
        </p>
        <h3 class="mt-2 text-lg font-semibold">
          {{ category?.name ?? "Category" }}
        </h3>
      </div>
    </template>

    <template #body>
      <div class="text-sm text-slate-600">
        This action cannot be undone. Are you sure you want to delete this
        category?
      </div>
    </template>

    <template #footer>
      <div class="flex justify-end gap-2 w-full">
        <UButton color="neutral" variant="ghost" @click="emit('close', false)">
          Cancel
        </UButton>
        <UButton color="error" :loading="isDeleting" @click="handleDelete">
          Delete
        </UButton>
      </div>
    </template>
  </UModal>
</template>
