<script setup lang="ts">
import { getPaginationRowModel } from "@tanstack/vue-table";
import type { TableColumn } from "@nuxt/ui";
import type { User } from "~/types/user";
import { formatShortDate } from "~/utils/format";
import AdminWarehouseUserRowActions from "./AdminWarehouseUserRowActions.vue";

type BadgeColor =
  | "primary"
  | "secondary"
  | "success"
  | "info"
  | "warning"
  | "error"
  | "neutral";

const table = useTemplateRef("table");
const props = defineProps<{
  users: User[];
  assignments: Record<string, string[]>;
  warehouseOptions: string[];
}>();

const statusTone = (user: User): BadgeColor =>
  user.is_active ? "success" : "warning";

const columns: TableColumn<User>[] = [
  { id: "name", header: "Name", accessorFn: (row) => row.full_name },
  { id: "role", header: "Role", accessorFn: (row) => row.role },
  {
    id: "warehouse",
    header: "Assigned Warehouse",
    accessorFn: (row) => (props.assignments[row.id] ?? []).join(", "),
  },
  { id: "email", header: "Email", accessorFn: (row) => row.email },
  { id: "status", header: "Status", accessorFn: (row) => row.is_active },
  { id: "updated", header: "Updated", accessorFn: (row) => row.updated_at },
  { id: "actions", header: "" },
];

const pagination = ref({
  pageIndex: 0,
  pageSize: 6,
});
</script>

<template>
  <UCard>
    <UTable
      ref="table"
      v-model:pagination="pagination"
      :data="props.users"
      :columns="columns"
      class="text-sm"
      :pagination-options="{
        getPaginationRowModel: getPaginationRowModel(),
      }"
    >
      <template #name-cell="{ row }">
        <div class="flex flex-col">
          <span class="font-medium">{{ row.original.full_name }}</span>
          <span class="text-xs text-slate-500">{{ row.original.id }}</span>
        </div>
      </template>
      <template #role-cell="{ row }">
        <span class="text-slate-700">
          {{ row.original.role.replace("_", " ") }}
        </span>
      </template>
      <template #warehouse-cell="{ row }">
        <span class="text-slate-600">
          {{ (props.assignments[row.original.id] ?? []).join(", ") || "Unassigned" }}
        </span>
      </template>
      <template #email-cell="{ row }">
        <span class="text-slate-600">{{ row.original.email }}</span>
      </template>
      <template #status-cell="{ row }">
        <UBadge :color="statusTone(row.original)" variant="subtle">
          {{ row.original.is_active ? "Active" : "Inactive" }}
        </UBadge>
      </template>
      <template #updated-cell="{ row }">
        <span class="text-slate-600">
          {{ formatShortDate(row.original.updated_at) }}
        </span>
      </template>
      <template #actions-cell="{ row }">
        <div class="flex justify-end">
          <AdminWarehouseUserRowActions
            :user="row.original"
            :assignments="props.assignments"
            :warehouse-options="props.warehouseOptions"
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