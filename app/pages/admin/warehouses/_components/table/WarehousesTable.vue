<script setup lang="ts">
import { getPaginationRowModel } from "@tanstack/vue-table";
import type { TableColumn } from "@nuxt/ui";
import type { Warehouse } from "~/types/warehouse";
import { formatShortDateOrFallback } from "~/utils/format";
import AdminTableEmptyState from "../../../_components/AdminTableEmptyState.vue";
import {
  getWarehouseStatusColor,
  getWarehouseStatusLabel,
  isMatchingWarehouseStatusFilter,
} from "../warehouse-options";
import WarehouseRowActions from "./WarehouseRowActions.vue";

const table = useTemplateRef("table");

const props = defineProps<{
  warehouses: Warehouse[];
  search: string;
  status: string;
  isLoading: boolean;
}>();

const filteredWarehouses = computed(() =>
  props.warehouses.filter((warehouse) =>
    isMatchingWarehouseStatusFilter(warehouse, props.status),
  ),
);

const hasRows = computed(() => filteredWarehouses.value.length > 0);
const hasSearch = computed(() => props.search.trim().length > 0);
const hasStatusFilter = computed(() => props.status !== "all");

const emptyTitle = computed(() =>
  hasSearch.value || hasStatusFilter.value
    ? "No warehouses match the current filters"
    : "No warehouses yet",
);

const emptyDescription = computed(() =>
  hasSearch.value || hasStatusFilter.value
    ? "Try a different search term or status."
    : "Create a warehouse to assign products and track stock locations.",
);

const columns: TableColumn<Warehouse>[] = [
  {
    id: "warehouse",
    header: "Warehouse",
    accessorFn: (row) => row.name,
  },
  {
    id: "capacity",
    header: "Capacity",
    accessorFn: (row) => row.capacity,
  },
  {
    id: "status",
    header: "Status",
    accessorFn: (row) => row.status,
  },
  {
    id: "updated",
    header: "Updated",
    accessorFn: (row) => row.updated_at,
  },
  {
    id: "actions",
    header: "",
  },
];

const pagination = ref({
  pageIndex: 0,
  pageSize: 6,
});
</script>

<template>
  <UCard>
    <UTable
      v-if="props.isLoading || hasRows"
      ref="table"
      v-model:pagination="pagination"
      :data="filteredWarehouses"
      :columns="columns"
      class="text-sm"
      :pagination-options="{
        getPaginationRowModel: getPaginationRowModel(),
      }"
      :loading="props.isLoading"
    >
      <template #warehouse-cell="{ row }">
        <div class="flex flex-col">
          <NuxtLink
            :to="`/admin/warehouses/${row.original.id}`"
            class="font-medium text-slate-900 transition hover:text-primary"
          >
            {{ row.original.name }}
          </NuxtLink>
          <span class="text-xs text-slate-500">
            {{ row.original.address }}
          </span>
        </div>
      </template>

      <template #capacity-cell="{ row }">
        <div class="flex flex-col">
          <span class="font-medium text-slate-900">
            {{ Number(row.original.capacity ?? 0).toLocaleString() }}
          </span>
          <span class="text-xs text-slate-500">
            stock capacity
          </span>
        </div>
      </template>

      <template #status-cell="{ row }">
        <UBadge
          :color="getWarehouseStatusColor(row.original.status)"
          variant="subtle"
        >
          {{ getWarehouseStatusLabel(row.original.status) }}
        </UBadge>
      </template>

      <template #updated-cell="{ row }">
        <div class="flex flex-col">
          <span class="text-slate-700">
            {{ formatShortDateOrFallback(row.original.updated_at) }}
          </span>
          <span class="text-xs text-slate-500">
            Created {{ formatShortDateOrFallback(row.original.created_at, "_") }}
          </span>
        </div>
      </template>

      <template #actions-cell="{ row }">
        <div class="flex justify-end">
          <WarehouseRowActions :warehouse="row.original" />
        </div>
      </template>
    </UTable>

    <AdminTableEmptyState
      v-else
      :title="emptyTitle"
      :description="emptyDescription"
    />

    <div
      v-if="hasRows"
      class="flex justify-end border-t border-default px-4 pt-4"
    >
      <UPagination
        :page="(table?.tableApi?.getState().pagination.pageIndex || 0) + 1"
        :items-per-page="table?.tableApi?.getState().pagination.pageSize"
        :total="table?.tableApi?.getFilteredRowModel().rows.length"
        @update:page="(p) => table?.tableApi?.setPageIndex(p - 1)"
      />
    </div>
  </UCard>
</template>
