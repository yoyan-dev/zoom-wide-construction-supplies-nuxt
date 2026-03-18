<script setup lang="ts">
import CategoryForm from "../CategoryForm.vue";

defineProps<{ payload?: unknown }>();
const emit = defineEmits<{ close: [boolean] }>();

const categoryStore = useCategoryStore();
const isSaving = ref(false);

const handleSave = async (
  payload: Omit<
    import("~/types/category").Category,
    "id" | "created_at" | "updated_at"
  >,
) => {
  isSaving.value = true;
  await categoryStore.createCategory(payload);
  isSaving.value = false;
  emit("close", false);
};
</script>

<template>
  <UModal :close="{ onClick: () => emit('close', false) }">
    <template #header>
      <div>
        <p class="text-xs uppercase tracking-[0.18em] text-slate-500">
          New Category
        </p>
        <h3 class="mt-2 text-lg font-semibold">Create a category</h3>
      </div>
    </template>
    <template #body>
      <CategoryForm
        :category="null"
        submit-label="Create Category"
        cancel-label="Cancel"
        @submit="handleSave"
        @cancel="emit('close', false)"
      />
    </template>
  </UModal>
</template>
