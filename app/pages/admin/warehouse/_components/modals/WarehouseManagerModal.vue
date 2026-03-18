<script setup lang="ts">
import type { Warehouse } from "~/types/warehouse";
import type { User } from "~/types/user";

type ManagerPayload = {
  warehouse: Warehouse;
  managers: User[];
};

const props = defineProps<{
  payload: ManagerPayload | null;
}>();

const emit = defineEmits<{ close: [boolean] }>();

const warehouseStore = useWarehouseStore();

const managerOptions = computed(() => {
  const managers = props.payload?.managers ?? [];
  return [
    { label: "Unassigned", value: "" },
    ...managers.map((manager) => ({
      label: manager.full_name,
      value: manager.id,
    })),
  ];
});

const selectedManager = ref("");

watch(
  () => props.payload,
  (value) => {
    selectedManager.value = value?.warehouse.manager_id ?? "";
  },
  { immediate: true },
);

const handleSave = async () => {
  const warehouseId = props.payload?.warehouse.id;
  if (!warehouseId) return;
  await warehouseStore.assignWarehouseManager(
    warehouseId,
    selectedManager.value || null,
  );
  emit("close", false);
};
</script>

<template>
  <UModal :close="{ onClick: () => emit('close', false) }">
    <template #header>
      <div>
        <p class="text-xs uppercase tracking-[0.18em] text-slate-500">
          Assign Manager
        </p>
        <h3 class="mt-2 text-lg font-semibold">
          {{ props.payload?.warehouse.name ?? "Warehouse" }}
        </h3>
      </div>
    </template>
    <template #body>
      <UFormField label="Warehouse manager">
        <USelect
          class="w-full"
          valueKey="value"
          labelKey="label"
          v-model="selectedManager"
          :items="managerOptions"
        />
      </UFormField>
    </template>
    <template #footer>
      <div class="flex justify-end gap-2 w-full">
        <UButton color="neutral" variant="ghost" @click="emit('close', false)">
          Cancel
        </UButton>
        <UButton color="primary" @click="handleSave">Save</UButton>
      </div>
    </template>
  </UModal>
</template>
