<script setup lang="ts">
import type { Warehouse } from "~/types/warehouse";
import type { User } from "~/types/user";

type StaffPayload = {
  warehouse: Warehouse;
  users: User[];
  assignments: Record<string, string[]>;
};

const props = defineProps<{
  payload: StaffPayload | null;
}>();

const emit = defineEmits<{ close: [boolean] }>();

const warehouseUsersStore = useWarehouseUsersStore();

const userOptions = computed(() =>
  (props.payload?.users ?? []).map((user) => ({
    label: user.full_name,
    value: user.id,
  })),
);

const selectedUser = ref("");

const handleAssign = () => {
  const warehouseName = props.payload?.warehouse.name;
  if (!warehouseName || !selectedUser.value) return;

  const currentAssignments = props.payload?.assignments[selectedUser.value] ?? [];
  const nextAssignments = currentAssignments.includes(warehouseName)
    ? currentAssignments
    : [...currentAssignments, warehouseName];

  warehouseUsersStore.updateAssignments(selectedUser.value, nextAssignments);
  emit("close", false);
};
</script>

<template>
  <UModal :close="{ onClick: () => emit('close', false) }">
    <template #header>
      <div>
        <p class="text-xs uppercase tracking-[0.18em] text-slate-500">
          Assign Staff
        </p>
        <h3 class="mt-2 text-lg font-semibold">
          {{ props.payload?.warehouse.name ?? "Warehouse" }}
        </h3>
      </div>
    </template>
    <template #body>
      <UFormField label="Select staff member">
        <USelect
          class="w-full"
          valueKey="value"
          labelKey="label"
          v-model="selectedUser"
          :items="userOptions"
          placeholder="Select user"
        />
      </UFormField>
    </template>
    <template #footer>
      <div class="flex justify-end gap-2 w-full">
        <UButton color="neutral" variant="ghost" @click="emit('close', false)">
          Cancel
        </UButton>
        <UButton color="primary" :disabled="!selectedUser" @click="handleAssign">
          Assign
        </UButton>
      </div>
    </template>
  </UModal>
</template>
