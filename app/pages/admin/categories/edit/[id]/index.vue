<script setup lang="ts">
import { storeToRefs } from "pinia";
import type { Category } from "~/types/category";
import { useModal } from "~/composables/admin/useModal";
import ActionConfirmModal from "../../../_components/modals/ActionConfirmModal.vue";
import CategoryForm from "../../_components/CategoryForm.vue";

definePageMeta({
  layout: "admin",
});

const route = useRoute();
const router = useRouter();
const categoryId = computed(() => String(route.params.id));

const categoryStore = useCategoryStore();
const { notifyResponse } = useAdminResponseToast();
const { openModal } = useModal();

await categoryStore.fetchCategoryById(categoryId.value);

const { category } = storeToRefs(categoryStore);

const handleSave = async (
  payload: Omit<Category, "id" | "created_at" | "updated_at">,
) => {
  if (!category.value?.id) return;
  const response = await categoryStore.updateCategory(category.value.id, payload);

  if (
    !notifyResponse(response, {
      successTitle: "Category updated",
      successDescription: `Saved changes to ${payload.name}.`,
      errorTitle: "Category not updated",
    })
  ) {
    return;
  }

  router.push("/admin/categories");
};

const handleDelete = () => {
  if (!category.value?.id) return;
  openModal(ActionConfirmModal, {
    title: "Delete category",
    description: `Delete ${category.value.name}? This cannot be undone.`,
    confirmLabel: "Delete",
    confirmColor: "error",
    onConfirm: async () => {
      const response = await categoryStore.deleteCategory(category.value!.id);

      if (
        !notifyResponse(response, {
          successTitle: "Category deleted",
          successDescription: `Removed ${category.value?.name ?? "the category"}.`,
          errorTitle: "Category not deleted",
        })
      ) {
        return false;
      }

      router.push("/admin/categories");
      return true;
    },
  });
};
</script>

<template>
  <div class="min-h-screen">
    <div class="space-y-6">
      <section class="bg-white p-2">
        <div
          class="flex flex-col gap-4 md:flex-row md:items-center md:justify-between"
        >
          <div>
            <p class="text-xs uppercase tracking-[0.18em] text-slate-500">
              Catalog Structure
            </p>
            <h1 class="mt-2 text-2xl font-semibold">Edit Category</h1>
            <p class="mt-2 text-sm text-slate-600">
              Update category content, handbook guidance, and visual identity.
            </p>
          </div>
          <div class="flex flex-wrap items-center gap-2">
            <UButton color="neutral" variant="outline" to="/admin/categories">
              Back to Categories
            </UButton>
            <UButton color="error" variant="outline" @click="handleDelete">
              Delete Category
            </UButton>
          </div>
        </div>
      </section>

      <UCard v-if="category">
        <CategoryForm
          :category="category"
          submit-label="Save Changes"
          cancel-label="Back"
          @submit="handleSave"
          @cancel="router.push('/admin/categories')"
        />
      </UCard>

      <UCard v-else>
        <p class="text-sm text-slate-600">
          Category not found. Check the URL or return to the categories list.
        </p>
      </UCard>
    </div>
  </div>
</template>
