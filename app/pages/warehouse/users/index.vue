<script setup lang="ts">
import type { User } from "~/types/user";
import WarehouseUsersTable from "../_components/table/WarehouseUsersTable.vue";
import { warehouseUserAssignments, warehouseUsers } from "~/seeds/warehouse-users";
import { defaultAssignedWarehouses } from "~/utils/warehouse";

definePageMeta({
  layout: "warehouse",
});

const users = useState<User[]>("warehouse-users", () => [...warehouseUsers]);
const userWarehouses = useState<Record<string, string[]>>(
  "warehouse-user-warehouses",
  () => ({ ...warehouseUserAssignments }),
);

const assignedWarehouses = defaultAssignedWarehouses;

const isVisibleUser = (user: User) => {
  const assigned = userWarehouses.value[user.id] ?? [];
  return assigned.some((warehouse) => assignedWarehouses.includes(warehouse));
};

const visibleUsers = computed(() => users.value.filter(isVisibleUser));

const updateUser = (id: string, payload: Partial<User>) => {
  users.value = users.value.map((user) =>
    user.id === id ? { ...user, ...payload } : user,
  );
};

const updateWarehouses = (id: string, warehouses: string[]) => {
  userWarehouses.value = {
    ...userWarehouses.value,
    [id]: warehouses,
  };
};

const deleteUser = (id: string) => {
  users.value = users.value.filter((user) => user.id !== id);
  const next = { ...userWarehouses.value };
  delete next[id];
  userWarehouses.value = next;
};
</script>

<template>
  <div class="min-h-screen">
    <div class="space-y-6">
      <section class="bg-white p-2">
        <div
          class="flex flex-col gap-4 md:flex-row md:items-center md:justify-between"
        >
          <div>
            <p class="text-xs uppercase tracking-[0.18em] text-slate-500">
              Warehouse Users
            </p>
            <h1 class="mt-2 text-2xl font-semibold">Access Management</h1>
            <p class="mt-2 text-sm text-slate-600">
              Manage staff accounts assigned to your warehouse.
            </p>
          </div>
          <div class="rounded-full border border-slate-200/70 px-4 py-2 text-sm">
            Assigned: {{ assignedWarehouses.join(", ") }}
          </div>
        </div>
      </section>

      <WarehouseUsersTable
        :users="visibleUsers"
        :warehouses-by-user="userWarehouses"
        :on-update-user="updateUser"
        :on-update-warehouses="updateWarehouses"
        :on-delete="deleteUser"
      />
    </div>
  </div>
</template>
