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
          Delete Category
        </p>
        <h3 class="mt-2 text-lg font-semibold">
          {{ category?.name ?? "Category" }}
        </h3>
      </div>
    </template>

    <template #body>
      <div class="text-sm text-slate-600">
        This action cannot be undone. Are you sure you want to delete this
        category?
      </div>
    </template>

    <template #footer>
      <div class="flex justify-end gap-2 w-full">
        <UButton color="neutral" variant="ghost" @click="emit('close', false)">
          Cancel
        </UButton>
        <UButton color="error">Delete</UButton>
      </div>
    </template>
  </UModal>
</template>
