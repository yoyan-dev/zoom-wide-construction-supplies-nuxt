<script setup lang="ts">
import { getPaginationRowModel } from "@tanstack/vue-table";
import type { TableColumn } from "@nuxt/ui";
import type { Warehouse } from "~/types/warehouse";
import type { User } from "~/types/user";
import { formatShortDate, formatNumber } from "~/utils/format";
import WarehouseRowActions from "./WarehouseRowActions.vue";

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
  warehouses: Warehouse[];
  managers: User[];
  managerMap: Record<string, User | undefined>;
}>();

const statusTone: Record<Warehouse["status"], BadgeColor> = {
  active: "success",
  inactive: "warning",
  archived: "neutral",
};

const columns: TableColumn<Warehouse>[] = [
  { id: "name", header: "Warehouse", accessorFn: (row) => row.name },
  { id: "address", header: "Address", accessorFn: (row) => row.address },
  { id: "manager", header: "Manager", accessorFn: (row) => row.manager_id ?? "" },
  { id: "capacity", header: "Capacity", accessorFn: (row) => row.capacity },
  { id: "status", header: "Status", accessorFn: (row) => row.status },
  { id: "created", header: "Created", accessorFn: (row) => row.created_at },
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
      :data="props.warehouses"
      :columns="columns"
      class="text-sm"
      :pagination-options="{ getPaginationRowModel: getPaginationRowModel() }"
    >
      <template #name-cell="{ row }">
        <div class="flex flex-col">
          <span class="font-medium">{{ row.original.name }}</span>
          <span class="text-xs text-slate-500">{{ row.original.id }}</span>
        </div>
      </template>
      <template #address-cell="{ row }">
        <span class="text-slate-600">{{ row.original.address }}</span>
      </template>
      <template #manager-cell="{ row }">
        <span class="text-slate-700">
          {{ props.managerMap[row.original.manager_id ?? ""]?.full_name ?? "Unassigned" }}
        </span>
      </template>
      <template #capacity-cell="{ row }">
        <span class="text-slate-700">
          {{ formatNumber(row.original.capacity) }} units
        </span>
      </template>
      <template #status-cell="{ row }">
        <UBadge :color="statusTone[row.original.status]" variant="subtle">
          {{ row.original.status }}
        </UBadge>
      </template>
      <template #created-cell="{ row }">
        <span class="text-slate-600">
          {{ formatShortDate(row.original.created_at) }}
        </span>
      </template>
      <template #actions-cell="{ row }">
        <div class="flex justify-end">
          <WarehouseRowActions :warehouse="row.original" :managers="props.managers" />
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
