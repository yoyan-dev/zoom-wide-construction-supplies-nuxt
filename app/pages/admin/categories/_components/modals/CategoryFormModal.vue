<script setup lang="ts">
import type { Category } from "~/types/category";

type CategoryDraft = {
  name: string;
  description: string | null;
  image_url: string | null;
};

const props = defineProps<{
  open: boolean;
  mode: "create" | "edit";
  category: Category | null;
}>();

const emit = defineEmits<{
  (e: "update:open", value: boolean): void;
  (e: "submit", value: CategoryDraft): void;
}>();

const draft = ref<CategoryDraft>({
  name: "",
  description: "",
  image_url: null,
});

const resetDraft = () => {
  draft.value = {
    name: "",
    description: "",
    image_url: null,
  };
};

watch(
  () => [props.category, props.open, props.mode],
  () => {
    if (props.mode === "create") {
      resetDraft();
      return;
    }

    draft.value = {
      name: props.category?.name ?? "",
      description: props.category?.description ?? "",
      image_url: props.category?.image_url ?? null,
    };
  },
  { immediate: true },
);

const handleSubmit = () => {
  emit("submit", {
    name: draft.value.name,
    description: draft.value.description || null,
    image_url: draft.value.image_url || null,
  });
};
</script>

<template>
  <UModal :open="props.open" @update:open="emit('update:open', $event)">
    <template #header>
      <div>
        <p class="text-xs uppercase tracking-[0.18em] text-slate-500">
          {{ props.mode === "create" ? "New Category" : "Edit Category" }}
        </p>
        <h3 class="mt-2 text-lg font-semibold">
          {{
            props.mode === "create"
              ? "Create a category"
              : props.category?.name ?? "Edit category"
          }}
        </h3>
      </div>
    </template>

    <div class="space-y-4">
      <UFormField label="Category name">
        <UInput v-model="draft.name" placeholder="Concrete & Cement" />
      </UFormField>
      <UFormField label="Description">
        <UTextarea
          v-model="draft.description"
          placeholder="Add a short description..."
        />
      </UFormField>
      <UFormField label="Image URL">
        <UInput
          v-model="draft.image_url"
          placeholder="https://example.com/category.jpg"
        />
      </UFormField>
    </div>

    <template #footer>
      <div class="flex justify-end gap-2">
        <UButton
          color="neutral"
          variant="ghost"
          @click="emit('update:open', false)"
        >
          Cancel
        </UButton>
        <UButton color="primary" @click="handleSubmit">
          {{ props.mode === "create" ? "Create" : "Save Changes" }}
        </UButton>
      </div>
    </template>
  </UModal>
</template>
