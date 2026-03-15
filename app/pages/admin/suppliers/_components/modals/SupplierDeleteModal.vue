<script setup lang="ts">
import type { Supplier } from "~/types/supplier";

const props = defineProps<{
  payload: Supplier | null;
}>();

const supplier = ref<Supplier | null>(props.payload);
const emit = defineEmits<{ close: [boolean] }>();
</script>

<template>
  <UModal :close="{ onClick: () => emit('close', false) }">
    <template #header>
      <div>
        <p class="text-xs uppercase tracking-[0.18em] text-slate-500">
          Delete Supplier
        </p>
        <h3 class="mt-2 text-lg font-semibold">
          {{ supplier?.name ?? "Supplier" }}
        </h3>
      </div>
    </template>
    <template #body>
      <div class="text-sm text-slate-600">
        This action cannot be undone. Are you sure you want to delete this
        supplier?
      </div>
    </template>

    <template #footer>
      <div class="flex justify-end gap-2">
        <UButton color="neutral" variant="ghost" @click="emit('close', false)">
          Cancel
        </UButton>
        <UButton color="error">Delete</UButton>
      </div>
    </template>
  </UModal>
</template>
