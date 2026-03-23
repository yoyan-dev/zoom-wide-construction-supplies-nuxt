<script setup lang="ts">
import type { Supplier } from "~/types/supplier";

const props = defineProps<{
  payload: Supplier | null;
}>();

const supplier = ref<Supplier | null>(props.payload);
const supplierStore = useSupplierStore();
const { notifyResponse } = useAdminResponseToast();
const isDeleting = ref(false);
const emit = defineEmits<{ close: [boolean] }>();

const handleDelete = async () => {
  if (!supplier.value?.id) return;
  isDeleting.value = true;
  const response = await supplierStore.deleteSupplier(supplier.value.id);
  isDeleting.value = false;

  if (
    !notifyResponse(response, {
      successTitle: "Supplier deleted",
      successDescription: `Removed ${supplier.value.name ?? "the supplier"}.`,
      errorTitle: "Supplier not deleted",
    })
  ) {
    return;
  }

  emit("close", false);
};
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
