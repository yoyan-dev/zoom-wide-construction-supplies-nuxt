<script setup lang="ts">
import { storeToRefs } from "pinia";
import type { UserRole } from "~/types/user";
import WarehousesTable from "./_components/table/WarehousesTable.vue";

definePageMeta({
  layout: "admin",
});

const warehouseStore = useWarehouseStore();
const warehouseUsersStore = useWarehouseUsersStore();

await Promise.all([
  warehouseStore.fetchWarehouses(),
  warehouseUsersStore.fetchUsers(),
]);

const { warehouses, query } = storeToRefs(warehouseStore);
const { users } = storeToRefs(warehouseUsersStore);

const role = useState<UserRole>("current-role", () => "admin");
const hasAccess = computed(() => role.value === "admin");

const statusFilter = ref(query.value.status || "all");
const sortBy = ref("name-asc");

const search = computed(() => query.value.q ?? "");

const handleSearch = async (value: string) => {
  await warehouseStore.setSearch(value);
};

const handleStatusFilter = async (value: string) => {
  statusFilter.value = value;
  await warehouseStore.setFilter({
    status: value === "all" ? "" : (value as any),
  });
};

const managers = computed(() =>
  users.value.filter((user) => user.role === "warehouse_manager"),
);

const managerMap = computed(() => {
  const map: Record<string, (typeof managers.value)[number]> = {};
  for (const manager of managers.value) {
    map[manager.id] = manager;
  }
  return map;
});

const sortedWarehouses = computed(() => {
  const items = [...warehouses.value];
  switch (sortBy.value) {
    case "name-desc":
      return items.sort((a, b) => b.name.localeCompare(a.name));
    case "capacity-desc":
      return items.sort((a, b) => b.capacity - a.capacity);
    case "capacity-asc":
      return items.sort((a, b) => a.capacity - b.capacity);
    case "created-desc":
      return items.sort(
        (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
      );
    case "created-asc":
      return items.sort(
        (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime(),
      );
    default:
      return items.sort((a, b) => a.name.localeCompare(b.name));
  }
});

const sortOptions = [
  { label: "Name (A-Z)", value: "name-asc" },
  { label: "Name (Z-A)", value: "name-desc" },
  { label: "Capacity (High-Low)", value: "capacity-desc" },
  { label: "Capacity (Low-High)", value: "capacity-asc" },
  { label: "Created (Newest)", value: "created-desc" },
  { label: "Created (Oldest)", value: "created-asc" },
];

const statusOptions = [
  { label: "All statuses", value: "all" },
  { label: "Active", value: "active" },
  { label: "Inactive", value: "inactive" },
  { label: "Archived", value: "archived" },
];
</script>

<template>
  <div class="min-h-screen">
    <div class="space-y-6">
      <section class="bg-white p-2">
        <div class="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p class="text-xs uppercase tracking-[0.18em] text-slate-500">
              Warehouse Management
            </p>
            <h1 class="mt-2 text-2xl font-semibold">Warehouses</h1>
            <p class="mt-2 text-sm text-slate-600">
              Manage warehouse locations, assignments, and operational status.
            </p>
          </div>
        </div>
      </section>

      <UCard v-if="!hasAccess">
        <p class="text-sm text-slate-600">
          You do not have permission to view warehouse management.
        </p>
      </UCard>

      <div v-else class="space-y-4">
        <UCard>
          <div class="flex flex-wrap items-center gap-3">
            <UInput
              :model-value="search"
              class="w-64"
              icon="i-lucide-search"
              placeholder="Search warehouses"
              @update:model-value="handleSearch(String($event))"
            />
            <USelect
              class="w-48"
              valueKey="value"
              labelKey="label"
              v-model="statusFilter"
              :items="statusOptions"
              @update:model-value="handleStatusFilter(String($event))"
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

        <WarehousesTable
          :warehouses="sortedWarehouses"
          :managers="managers"
          :manager-map="managerMap"
        />
      </div>
    </div>
  </div>
</template>
