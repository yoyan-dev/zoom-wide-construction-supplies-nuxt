<script setup lang="ts">
import { getPaginationRowModel } from "@tanstack/vue-table";
import type { TableColumn } from "@nuxt/ui";
import type { Driver } from "~/types/driver";
import { formatShortDate } from "~/utils/format";

const table = useTemplateRef("table");
const props = defineProps<{
  drivers: Driver[];
}>();

const columns: TableColumn<Driver>[] = [
  {
    id: "driver",
    header: "Driver",
    accessorFn: (row) => row.name,
  },
  {
    id: "contact",
    header: "Contact",
    accessorFn: (row) => row.phone ?? "",
  },
  {
    id: "vehicle",
    header: "Vehicle",
    accessorFn: (row) => row.vehicle_number ?? "",
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
  pageSize: 5,
});
</script>

<template>
  <UCard>
    <div class="mb-4 flex items-center justify-between">
      <div>
        <p class="text-xs uppercase tracking-[0.18em] text-slate-500">
          Driver Roster
        </p>
        <p class="mt-1 text-lg font-semibold">Driver overview</p>
      </div>
      <UButton color="neutral" variant="ghost" icon="i-lucide-filter">
        Filters
      </UButton>
    </div>

    <UTable
      ref="table"
      v-model:pagination="pagination"
      :data="props.drivers"
      :columns="columns"
      class="text-sm"
      :pagination-options="{
        getPaginationRowModel: getPaginationRowModel(),
      }"
    >
      <template #driver-cell="{ row }">
        <div class="flex flex-col">
          <span class="font-medium">{{ row.original.name }}</span>
          <span class="text-xs text-slate-500">
            {{ row.original.license_number ?? "No license" }}
          </span>
        </div>
      </template>
      <template #contact-cell="{ row }">
        <div class="flex flex-col">
          <span class="text-slate-700">
            {{ row.original.phone ?? "No phone" }}
          </span>
          <span class="text-xs text-slate-500">
            {{ row.original.email ?? "No email" }}
          </span>
        </div>
      </template>
      <template #vehicle-cell="{ row }">
        <span class="text-slate-600">
          {{ row.original.vehicle_number ?? "No vehicle" }}
        </span>
      </template>
      <template #updated-cell="{ row }">
        <span class="text-slate-600">
          {{ formatShortDate(row.original.updated_at) }}
        </span>
      </template>
      <template #actions-cell="{ row }">
        <div class="flex justify-end">
          <UButton color="neutral" variant="ghost" size="sm">
            View
          </UButton>
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
