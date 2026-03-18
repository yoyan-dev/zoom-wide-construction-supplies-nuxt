<script setup lang="ts">
import type { Warehouse } from "~/types/warehouse";

const props = defineProps<{
  payload: Warehouse | null;
}>();

const emit = defineEmits<{ close: [boolean] }>();

const warehouseStore = useWarehouseStore();

const warehouseId = computed(() => props.payload?.id ?? "");

const handleArchive = async () => {
  if (!warehouseId.value) return;
  await warehouseStore.setWarehouseStatus(warehouseId.value, "archived");
  emit("close", false);
};

const handleDelete = async () => {
  if (!warehouseId.value) return;
  await warehouseStore.deleteWarehouse(warehouseId.value);
  emit("close", false);
};
</script>

<template>
  <UModal :close="{ onClick: () => emit('close', false) }">
    <template #header>
      <div>
        <p class="text-xs uppercase tracking-[0.18em] text-slate-500">
          Warehouse
        </p>
        <h3 class="mt-2 text-lg font-semibold">Archive or Delete Warehouse</h3>
      </div>
    </template>
    <template #body>
      <div class="space-y-3 text-sm text-slate-600">
        <p>{{ props.payload?.name ?? "Selected warehouse" }}</p>
        <p>
          Archiving hides this warehouse from active operations. Deleting removes it
          permanently.
        </p>
      </div>
    </template>
    <template #footer>
      <div class="flex flex-wrap justify-end gap-2 w-full">
        <UButton color="neutral" variant="ghost" @click="emit('close', false)">
          Cancel
        </UButton>
        <UButton color="warning" variant="outline" @click="handleArchive">
          Archive
        </UButton>
        <UButton color="error" @click="handleDelete">Delete</UButton>
      </div>
    </template>
  </UModal>
</template>
