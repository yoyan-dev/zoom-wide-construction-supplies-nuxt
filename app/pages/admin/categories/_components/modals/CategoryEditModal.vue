<script setup lang="ts">
import type { Category } from "~/types/category";
import CategoryForm from "../CategoryForm.vue";

const props = defineProps<{
  payload: Category | null;
}>();

const emit = defineEmits<{ close: [boolean] }>();

const categoryStore = useCategoryStore();

const categoryId = computed(() => props.payload?.id ?? "");

const handleSave = async (
  payload: Omit<Category, "id" | "created_at" | "updated_at">,
) => {
  if (!categoryId.value) return;
  await categoryStore.updateCategory(categoryId.value, payload);
  emit("close", false);
};
</script>

<template>
  <UModal :close="{ onClick: () => emit('close', false) }">
    <template #header>
      <div>
        <p class="text-xs uppercase tracking-[0.18em] text-slate-500">
          Edit Category
        </p>
        <h3 class="mt-2 text-lg font-semibold">Edit category details</h3>
      </div>
    </template>
    <template #body>
      <CategoryForm
        :category="props.payload"
        submit-label="Save Changes"
        cancel-label="Cancel"
        @submit="handleSave"
        @cancel="emit('close', false)"
      />
    </template>
  </UModal>
</template>
