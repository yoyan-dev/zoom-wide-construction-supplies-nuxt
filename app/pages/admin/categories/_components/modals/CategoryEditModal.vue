<script setup lang="ts">
import { useAdminResponseToast } from "~/composables/admin/useAdminResponseToast";
import CategoryForm from "../CategoryForm.vue";
import type { Category } from "~/types/category";

const props = defineProps<{
  payload: Category | null;
}>();

const emit = defineEmits<{ close: [boolean] }>();

const categoryStore = useCategoryStore();
const { notifyResponse } = useAdminResponseToast();
const isSaving = ref(false);

const categoryId = computed(() => props.payload?.id ?? "");
type CategoryPayload = Omit<Category, "id" | "created_at" | "updated_at">;

const handleSave = async (payload: CategoryPayload) => {
  if (!categoryId.value) return;

  isSaving.value = true;
  const response = await categoryStore.updateCategory(
    categoryId.value,
    payload,
  );
  isSaving.value = false;

  if (
    !notifyResponse(response, {
      successTitle: "Category updated",
      successDescription: `Saved changes to ${payload.name}.`,
      errorTitle: "Category not updated",
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
          Edit Category
        </p>
        <h3 class="mt-2 text-lg font-semibold">Edit category details</h3>
      </div>
    </template>
    <template #body>
      <CategoryForm
        :category="props.payload"
        submit-label="Save Changes"
        :is-submitting="isSaving"
        @submit="handleSave"
        @cancel="emit('close', false)"
      />
    </template>
  </UModal>
</template>
