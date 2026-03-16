<script setup lang="ts">
import { storeToRefs } from "pinia";
import type { Category } from "~/types/category";
import { useModal } from "~/composables/admin/useModal";
import ActionConfirmModal from "../../../_components/modals/ActionConfirmModal.vue";

definePageMeta({
  layout: "admin",
});

const route = useRoute();
const router = useRouter();
const categoryId = computed(() => String(route.params.id));

const categoryStore = useCategoryStore();
const { openModal } = useModal();

await categoryStore.fetchCategoryById(categoryId.value);

const { category, categoryMeta } = storeToRefs(categoryStore);

const statusOptions = [
  { label: "Active", value: "active" },
  { label: "Inactive", value: "inactive" },
  { label: "Archived", value: "archived" },
];

const draft = reactive({
  name: "",
  description: "",
  image_url: "",
  parent_id: "",
  status: "active",
});

watch(
  () => category.value,
  (value) => {
    const meta = categoryMeta.value[categoryId.value] ?? {};
    draft.name = value?.name ?? "";
    draft.description = value?.description ?? "";
    draft.image_url = value?.image_url ?? "";
    draft.parent_id = meta.parent_id ?? "";
    draft.status = meta.status ?? "active";
  },
  { immediate: true },
);

const handleSave = async () => {
  if (!category.value?.id) return;
  await categoryStore.updateCategory(category.value.id, {
    name: draft.name,
    description: draft.description,
    image_url: draft.image_url,
  } as Partial<Category>);
  categoryStore.changeCategoryParent(
    category.value.id,
    draft.parent_id.trim() || null,
  );
  categoryStore.setCategoryStatus(category.value.id, draft.status as any);
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
      await categoryStore.deleteCategory(category.value!.id);
      router.push("/admin/categories");
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
              Update naming, structure, and visibility for this category.
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
        <div class="grid gap-6 md:grid-cols-2">
          <UFormField label="Category name">
            <UInput class="w-full" v-model="draft.name" />
          </UFormField>
          <UFormField label="Status">
            <USelect
              class="w-full"
              valueKey="value"
              labelKey="label"
              v-model="draft.status"
              :items="statusOptions"
            />
          </UFormField>
          <UFormField label="Parent category ID">
            <UInput class="w-full" v-model="draft.parent_id" />
          </UFormField>
          <UFormField label="Image URL">
            <UInput class="w-full" v-model="draft.image_url" />
          </UFormField>
        </div>

        <div class="mt-6">
          <UFormField label="Description">
            <UTextarea class="w-full" v-model="draft.description" />
          </UFormField>
        </div>

        <div class="mt-6 flex justify-end gap-2">
          <UButton color="neutral" variant="ghost" to="/admin/categories">
            Cancel
          </UButton>
          <UButton color="primary" @click="handleSave">Save Changes</UButton>
        </div>
      </UCard>

      <UCard v-else>
        <p class="text-sm text-slate-600">
          Category not found. Check the URL or return to the categories list.
        </p>
      </UCard>
    </div>
  </div>
</template>
