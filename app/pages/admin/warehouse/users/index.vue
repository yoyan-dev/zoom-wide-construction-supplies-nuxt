<script setup lang="ts">
import { storeToRefs } from "pinia";
import type { UserRole } from "~/types/user";
import AdminWarehouseUsersTable from "../_components/table/AdminWarehouseUsersTable.vue";
import { warehouseOptions as defaultWarehouseOptions } from "~/utils/warehouse";

definePageMeta({
  layout: "admin",
});

const warehouseUsersStore = useWarehouseUsersStore();
const warehouseStore = useWarehouseStore();

await Promise.all([
  warehouseUsersStore.fetchUsers(),
  warehouseStore.fetchWarehouses(),
]);

const { users, assignments, query } = storeToRefs(warehouseUsersStore);
const { warehouses } = storeToRefs(warehouseStore);

const role = useState<UserRole>("current-role", () => "admin");
const hasAccess = computed(() => role.value === "admin");

const search = computed(() => query.value.q ?? "");
const roleFilter = ref("all");
const statusFilter = ref("all");
const warehouseFilter = ref("all");
const sortBy = ref("name-asc");

const handleSearch = async (value: string) => {
  await warehouseUsersStore.setSearch(value);
};

const warehouseNames = computed(() =>
  warehouses.value.length
    ? warehouses.value.map((warehouse) => warehouse.name)
    : defaultWarehouseOptions,
);

const roleOptions = [
  { label: "All roles", value: "all" },
  { label: "Warehouse Manager", value: "warehouse_manager" },
  { label: "Staff", value: "staff" },
  { label: "Admin", value: "admin" },
];

const statusOptions = [
  { label: "All statuses", value: "all" },
  { label: "Active", value: "active" },
  { label: "Inactive", value: "inactive" },
];

const warehouseOptions = computed(() => [
  { label: "All warehouses", value: "all" },
  ...warehouseNames.value.map((name) => ({ label: name, value: name })),
]);

const sortOptions = [
  { label: "Name (A-Z)", value: "name-asc" },
  { label: "Name (Z-A)", value: "name-desc" },
  { label: "Role (A-Z)", value: "role-asc" },
  { label: "Role (Z-A)", value: "role-desc" },
  { label: "Updated (Newest)", value: "updated-desc" },
  { label: "Updated (Oldest)", value: "updated-asc" },
];

const filteredUsers = computed(() => {
  let items = [...users.value];

  if (roleFilter.value !== "all") {
    items = items.filter((user) => user.role === roleFilter.value);
  }

  if (statusFilter.value !== "all") {
    items = items.filter((user) =>
      statusFilter.value === "active" ? user.is_active : !user.is_active,
    );
  }

  if (warehouseFilter.value !== "all") {
    items = items.filter((user) =>
      (assignments.value[user.id] ?? []).includes(warehouseFilter.value),
    );
  }

  switch (sortBy.value) {
    case "name-desc":
      return items.sort((a, b) => b.full_name.localeCompare(a.full_name));
    case "role-asc":
      return items.sort((a, b) => a.role.localeCompare(b.role));
    case "role-desc":
      return items.sort((a, b) => b.role.localeCompare(a.role));
    case "updated-desc":
      return items.sort(
        (a, b) =>
          new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime(),
      );
    case "updated-asc":
      return items.sort(
        (a, b) =>
          new Date(a.updated_at).getTime() - new Date(b.updated_at).getTime(),
      );
    default:
      return items.sort((a, b) => a.full_name.localeCompare(b.full_name));
  }
});
</script>

<template>
  <div class="min-h-screen">
    <div class="space-y-6">
      <section class="bg-white p-2">
        <div class="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p class="text-xs uppercase tracking-[0.18em] text-slate-500">
              Warehouse Users
            </p>
            <h1 class="mt-2 text-2xl font-semibold">Warehouse Staff</h1>
            <p class="mt-2 text-sm text-slate-600">
              Manage warehouse staff accounts, access, and assignments.
            </p>
          </div>
        </div>
      </section>

      <UCard v-if="!hasAccess">
        <p class="text-sm text-slate-600">
          You do not have permission to view warehouse users.
        </p>
      </UCard>

      <div v-else class="space-y-4">
        <UCard>
          <div class="flex flex-wrap items-center gap-3">
            <UInput
              :model-value="search"
              class="w-64"
              icon="i-lucide-search"
              placeholder="Search users"
              @update:model-value="handleSearch(String($event))"
            />
            <USelect
              class="w-48"
              valueKey="value"
              labelKey="label"
              v-model="roleFilter"
              :items="roleOptions"
            />
            <USelect
              class="w-48"
              valueKey="value"
              labelKey="label"
              v-model="statusFilter"
              :items="statusOptions"
            />
            <USelect
              class="w-56"
              valueKey="value"
              labelKey="label"
              v-model="warehouseFilter"
              :items="warehouseOptions"
            />
            <USelect
              class="w-56"
              valueKey="value"
              labelKey="label"
              v-model="sortBy"
              :items="sortOptions"
            />
          </div>
        </UCard>

        <AdminWarehouseUsersTable
          :users="filteredUsers"
          :assignments="assignments"
          :warehouse-options="warehouseNames"
        />
      </div>
    </div>
  </div>
</template>