<script setup lang="ts">
import WarehouseForm, { type WarehouseSubmitValue } from "../WarehouseForm.vue";
import { useAdminResponseToast } from "~/composables/admin/useAdminResponseToast";

const emit = defineEmits<{ close: [boolean] }>();

const warehouseStore = useWarehouseStore();
const { notifyResponse } = useAdminResponseToast();
const isSaving = ref(false);

const handleSave = async (payload: WarehouseSubmitValue) => {
  isSaving.value = true;
  const response = await warehouseStore.addWarehouse(payload);
  isSaving.value = false;

  if (
    !notifyResponse(response, {
      successTitle: "Warehouse created",
      successDescription: `Added ${payload.name}.`,
      errorTitle: "Warehouse not created",
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
          New Warehouse
        </p>
        <h3 class="mt-2 text-lg font-semibold">Create warehouse</h3>
      </div>
    </template>
    <template #body>
      <WarehouseForm
        :warehouse="null"
        submit-label="Create Warehouse"
        :is-submitting="isSaving"
        @submit="handleSave"
        @cancel="emit('close', false)"
      />
    </template>
  </UModal>
</template>
