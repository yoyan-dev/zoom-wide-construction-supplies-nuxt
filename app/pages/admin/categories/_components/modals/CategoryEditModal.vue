<script setup lang="ts">
import type { Category } from "~/types/category";

const props = defineProps<{
  payload: Category | null;
}>();

const emit = defineEmits<{ close: [boolean] }>();

const categoryStore = useCategoryStore();
const isSaving = ref(false);

const form = reactive({
  name: "",
  description: "",
  image_url: "",
});

const categoryId = computed(() => props.payload?.id ?? "");

watch(
  () => props.payload,
  (value) => {
    form.name = value?.name ?? "";
    form.description = value?.description ?? "";
    form.image_url = value?.image_url ?? "";
  },
  { immediate: true },
);

const handleSave = async () => {
  if (!categoryId.value) return;
  if (!form.name.trim()) return;
  isSaving.value = true;
  await categoryStore.updateCategory(categoryId.value, {
    name: form.name.trim(),
    description: form.description.trim(),
    image_url: form.image_url.trim(),
  });
  isSaving.value = false;
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
      <div class="space-y-4">
        <UFormField label="Category name">
          <UInput
            class="w-full"
            v-model="form.name"
            placeholder="Concrete & Cement"
          />
        </UFormField>
        <UFormField label="Description">
          <UTextarea
            class="w-full"
            v-model="form.description"
            placeholder="Add a short description..."
          />
        </UFormField>
        <UFormField label="Image URL">
          <UInput
            class="w-full"
            v-model="form.image_url"
            placeholder="https://example.com/category.jpg"
          />
        </UFormField>
      </div>
    </template>

    <template #footer>
      <div class="flex justify-end gap-2 w-full">
        <UButton color="neutral" variant="ghost" @click="emit('close', false)">
          Cancel
        </UButton>
        <UButton
          color="primary"
          :disabled="!categoryId || !form.name.trim()"
          :loading="isSaving"
          @click="handleSave"
        >
          Save Changes
        </UButton>
      </div>
    </template>
  </UModal>
</template>
