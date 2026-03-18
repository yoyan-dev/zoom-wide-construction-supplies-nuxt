<script setup lang="ts">
const props = defineProps<{
  payload: { ids: string[]; onDeleted?: () => void } | null;
}>();

const emit = defineEmits<{ close: [boolean] }>();

const inventoryStore = useInventoryStore();
const isDeleting = ref(false);

const count = computed(() => props.payload?.ids?.length ?? 0);

const handleDelete = async () => {
  if (!props.payload?.ids?.length) return;
  isDeleting.value = true;
  for (const id of props.payload.ids) {
    await inventoryStore.deleteInventoryLog(id);
  }
  isDeleting.value = false;
  props.payload.onDeleted?.();
  emit("close", false);
};
</script>

<template>
  <UModal :close="{ onClick: () => emit('close', false) }">
    <template #header>
      <div>
        <p class="text-xs uppercase tracking-[0.18em] text-slate-500">
          Delete Entries
        </p>
        <h3 class="mt-2 text-lg font-semibold">
          Delete {{ count }} selected entries?
        </h3>
      </div>
    </template>

    <template #body>
      <div class="text-sm text-slate-600">
        This action cannot be undone. Are you sure you want to delete these
        inventory entries?
      </div>
    </template>

    <template #footer>
      <div class="flex justify-end gap-2 w-full">
        <UButton color="neutral" variant="ghost" @click="emit('close', false)">
          Cancel
        </UButton>
        <UButton color="error" :loading="isDeleting" @click="handleDelete">
          Delete
        </UButton>
      </div>
    </template>
  </UModal>
</template>
