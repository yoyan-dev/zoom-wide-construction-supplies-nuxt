<script setup lang="ts">
import type { Category } from "~/types/category";

const props = defineProps<{
  open: boolean;
  category: Category | null;
}>();

const emit = defineEmits<{
  (e: "update:open", value: boolean): void;
  (e: "confirm"): void;
}>();
</script>

<template>
  <UModal :open="props.open" @update:open="emit('update:open', $event)">
    <template #header>
      <div>
        <p class="text-xs uppercase tracking-[0.18em] text-slate-500">
          Delete Category
        </p>
        <h3 class="mt-2 text-lg font-semibold">
          {{ props.category?.name ?? "Category" }}
        </h3>
      </div>
    </template>

    <div class="text-sm text-slate-600">
      This action cannot be undone. Are you sure you want to delete this
      category?
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
        <UButton color="error" @click="emit('confirm')">Delete</UButton>
      </div>
    </template>
  </UModal>
</template>
