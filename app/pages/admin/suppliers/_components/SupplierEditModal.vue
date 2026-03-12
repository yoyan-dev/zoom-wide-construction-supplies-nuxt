<script setup lang="ts">
import type { Category } from "~/types/category";

const props = defineProps<{
  open: boolean;
  category: Category | null;
}>();

const emit = defineEmits<{
  (e: "update:open", value: boolean): void;
}>();

const draft = ref({
  name: "",
  description: "",
});

watch(
  () => props.category,
  (value) => {
    draft.value = {
      name: value?.name ?? "",
      description: value?.description ?? "",
    };
  },
  { immediate: true },
);
</script>

<template>
  <UModal :open="props.open" @update:open="emit('update:open', $event)">
    <template #header>
      <div>
        <p class="text-xs uppercase tracking-[0.18em] text-slate-500">
          Edit Category
        </p>
        <h3 class="mt-2 text-lg font-semibold">
          {{ props.category?.name ?? "New Category" }}
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
        <UButton color="primary">Save Changes</UButton>
      </div>
    </template>
  </UModal>
</template>
