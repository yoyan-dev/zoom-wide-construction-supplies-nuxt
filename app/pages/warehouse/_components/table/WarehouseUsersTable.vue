<script setup lang="ts">
import { getPaginationRowModel } from "@tanstack/vue-table";
import type { TableColumn } from "@nuxt/ui";
import type { User } from "~/types/user";
import WarehouseUserRowActions from "./WarehouseUserRowActions.vue";

const table = useTemplateRef("table");

const props = defineProps<{
  users: User[];
  warehousesByUser: Record<string, string[]>;
  onUpdateUser: (id: string, payload: Partial<User>) => void;
  onUpdateWarehouses: (id: string, warehouses: string[]) => void;
  onDelete: (id: string) => void;
}>();

const columns: TableColumn<User>[] = [
  { id: "name", header: "Name", accessorFn: (row) => row.full_name },
  { id: "role", header: "Role", accessorFn: (row) => row.role },
  { id: "warehouses", header: "Assigned Warehouse(s)", accessorFn: (row) => row.id },
  { id: "status", header: "Status", accessorFn: (row) => row.is_active },
  { id: "actions", header: "" },
];

const pagination = ref({
  pageIndex: 0,
  pageSize: 6,
});
</script>

<template>
  <UCard>
    <div class="mb-4">
      <p class="text-xs uppercase tracking-[0.18em] text-slate-500">
        Warehouse Users
      </p>
      <p class="mt-1 text-lg font-semibold">Staff access and roles</p>
    </div>

    <UTable
      ref="table"
      v-model:pagination="pagination"
      :data="props.users"
      :columns="columns"
      class="text-sm"
      :pagination-options="{ getPaginationRowModel: getPaginationRowModel() }"
    >
      <template #name-cell="{ row }">
        <div class="flex flex-col">
          <span class="font-medium">{{ row.original.full_name }}</span>
          <span class="text-xs text-slate-500">{{ row.original.email }}</span>
        </div>
      </template>
      <template #role-cell="{ row }">
        <UBadge color="info" variant="subtle">
          {{ row.original.role.replace("_", " ") }}
        </UBadge>
      </template>
      <template #warehouses-cell="{ row }">
        <div class="flex flex-wrap gap-1">
          <UBadge
            v-for="warehouse in props.warehousesByUser[row.original.id] ?? []"
            :key="warehouse"
            color="secondary"
            variant="subtle"
          >
            {{ warehouse }}
          </UBadge>
        </div>
      </template>
      <template #status-cell="{ row }">
        <UBadge :color="row.original.is_active ? 'success' : 'warning'" variant="subtle">
          {{ row.original.is_active ? "Active" : "Inactive" }}
        </UBadge>
      </template>
      <template #actions-cell="{ row }">
        <div class="flex justify-end">
          <WarehouseUserRowActions
            :user="row.original"
            :warehouses="props.warehousesByUser[row.original.id] ?? []"
            :on-update-user="props.onUpdateUser"
            :on-update-warehouses="props.onUpdateWarehouses"
            :on-delete="props.onDelete"
          />
        </div>
      </template>
    </UTable>

    <div class="flex justify-end border-t border-default pt-4 px-4">
      <UPagination
        :page="(table?.tableApi?.getState().pagination.pageIndex || 0) + 1"
        :items-per-page="table?.tableApi?.getState().pagination.pageSize"
        :total="table?.tableApi?.getFilteredRowModel().rows.length"
        @update:page="(p) => table?.tableApi?.setPageIndex(p - 1)"
      />
    </div>
  </UCard>
</template>
