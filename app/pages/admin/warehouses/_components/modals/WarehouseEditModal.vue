<script setup lang="ts">
import type { Warehouse } from "~/types/warehouse";
import WarehouseForm, { type WarehouseSubmitValue } from "../WarehouseForm.vue";
import { useAdminResponseToast } from "~/composables/admin/useAdminResponseToast";

const props = defineProps<{
  payload: Warehouse | null;
}>();

const emit = defineEmits<{ close: [boolean] }>();

const warehouseStore = useWarehouseStore();
const { notifyResponse } = useAdminResponseToast();
const isSaving = ref(false);

const warehouseId = computed(() => props.payload?.id ?? "");

const handleSave = async (payload: WarehouseSubmitValue) => {
  if (!warehouseId.value) {
    return;
  }

  isSaving.value = true;
  const response = await warehouseStore.updateWarehouse(warehouseId.value, payload);
  isSaving.value = false;

  if (
    !notifyResponse(response, {
      successTitle: "Warehouse updated",
      successDescription: `Saved changes to ${payload.name}.`,
      errorTitle: "Warehouse not updated",
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
          Edit Warehouse
        </p>
        <h3 class="mt-2 text-lg font-semibold">Update warehouse details</h3>
      </div>
    </template>
    <template #body>
      <WarehouseForm
        :warehouse="props.payload"
        submit-label="Save Changes"
        :is-submitting="isSaving"
        @submit="handleSave"
        @cancel="emit('close', false)"
      />
    </template>
  </UModal>
</template>
