<script setup lang="ts">
import { useAdminResponseToast } from "~/composables/admin/useAdminResponseToast";
import CategoryForm from "../CategoryForm.vue";
import type { Category } from "~/types/category";

defineProps<{ payload?: unknown }>();
const emit = defineEmits<{ close: [boolean] }>();

const categoryStore = useCategoryStore();
const { notifyResponse } = useAdminResponseToast();
const isSaving = ref(false);

type CategoryPayload = Omit<Category, "id" | "created_at" | "updated_at">;

const handleSave = async (payload: CategoryPayload) => {
  const formData = new FormData();

  formData.append("name", payload.name);
  formData.append("description", payload.description);

  if (payload.overview) {
    formData.append("overview", payload.overview);
  }

  formData.append("typical_uses", JSON.stringify(payload.typical_uses));
  formData.append(
    "buying_considerations",
    JSON.stringify(payload.buying_considerations),
  );
  formData.append("featured_specs", JSON.stringify(payload.featured_specs));

  isSaving.value = true;
  const response = await categoryStore.addCategory(formData);
  isSaving.value = false;
  if (
    !notifyResponse(response, {
      successTitle: "Category Added",
      successDescription: `New Category ${payload.name} created.`,
      errorTitle: "Category not added",
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
          New Category
        </p>
        <h3 class="mt-2 text-lg font-semibold">Create a category</h3>
      </div>
    </template>
    <template #body>
      <CategoryForm
        :category="null"
        submit-label="Create Category"
        :is-submitting="isSaving"
        @submit="handleSave"
        @cancel="emit('close', false)"
      />
    </template>
  </UModal>
</template>
