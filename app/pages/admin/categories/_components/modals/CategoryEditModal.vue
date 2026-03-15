<script setup lang="ts">
import type { Category } from "~/types/category";
const props = defineProps<{
  payload: Category | null;
}>();

const category = ref<Category | null>(props.payload);
console.log(props.payload);
const emit = defineEmits<{ close: [boolean] }>();
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
      <div class="space-y-4" v-if="category">
        <UFormField label="Category name">
          <UInput
            class="w-full"
            v-model="category.name"
            placeholder="Concrete & Cement"
          />
        </UFormField>
        <UFormField label="Description">
          <UTextarea
            class="w-full"
            v-model="category.description"
            placeholder="Add a short description..."
          />
        </UFormField>
        <UFormField label="Image URL">
          <UInput
            class="w-full"
            v-model="category.image_url"
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
        <UButton color="primary">Save Changes </UButton>
      </div>
    </template>
  </UModal>
</template>
