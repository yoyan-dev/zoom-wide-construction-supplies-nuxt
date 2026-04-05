<script setup lang="ts">
import { getPaginationRowModel } from "@tanstack/vue-table";
import type { TableColumn } from "@nuxt/ui";
import type { Driver } from "~/types/driver";
import { formatShortDateOrFallback } from "~/utils/format";
import AdminTableEmptyState from "../../../_components/AdminTableEmptyState.vue";
import DriverRowActions from "./DriverRowActions.vue";
import {
  getDriverStatusColor,
  getDriverStatusLabel,
  isMatchingDriverStatusFilter,
} from "../driver-options";

const table = useTemplateRef("table");

const props = defineProps<{
  drivers: Driver[];
  search: string;
  status: string;
  isLoading: boolean;
}>();

const filteredDrivers = computed(() =>
  props.drivers.filter((driver) =>
    isMatchingDriverStatusFilter(driver, props.status),
  ),
);

const hasRows = computed(() => filteredDrivers.value.length > 0);
const hasSearch = computed(() => props.search.trim().length > 0);
const hasStatusFilter = computed(() => props.status !== "all");

const emptyTitle = computed(() =>
  hasSearch.value || hasStatusFilter.value
    ? "No drivers match the current filters"
    : "No drivers yet",
);

const emptyDescription = computed(() =>
  hasSearch.value || hasStatusFilter.value
    ? "Try a different search term or status."
    : "Create a driver account to manage delivery-specific sign-ins separately from customers and internal users.",
);

const columns: TableColumn<Driver>[] = [
  {
    id: "driver",
    header: "Driver",
    accessorFn: (row) => row.name,
  },
  {
    id: "contact",
    header: "Contact",
    accessorFn: (row) => row.email,
  },
  {
    id: "status",
    header: "Status",
    accessorFn: (row) => row.is_active,
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
      :data="filteredDrivers"
      :columns="columns"
      class="text-sm"
      :pagination-options="{
        getPaginationRowModel: getPaginationRowModel(),
      }"
      :loading="props.isLoading"
    >
      <template #driver-cell="{ row }">
        <div class="flex flex-col">
          <NuxtLink
            :to="`/admin/drivers/${row.original.id}`"
            class="font-medium text-slate-900 transition hover:text-primary"
          >
            {{ row.original.name }}
          </NuxtLink>
          <span
            v-if="row.original.license_number"
            class="text-xs text-slate-500"
          >
            License {{ row.original.license_number }}
          </span>
          <span
            v-if="row.original.vehicle_number"
            class="text-xs text-slate-500"
          >
            Vehicle {{ row.original.vehicle_number }}
          </span>
        </div>
      </template>

      <template #contact-cell="{ row }">
        <div class="flex flex-col">
          <span class="text-slate-700">
            {{ row.original.email ?? "No email assigned" }}
          </span>
          <span class="text-xs text-slate-500">
            {{ row.original.phone ?? "No phone number" }}
          </span>
        </div>
      </template>

      <template #status-cell="{ row }">
        <div class="flex flex-col gap-1">
          <UBadge
            :color="getDriverStatusColor(row.original.is_active)"
            variant="subtle"
          >
            {{ getDriverStatusLabel(row.original.is_active) }}
          </UBadge>
          <span class="text-xs text-slate-500">
            Driver account
          </span>
        </div>
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
          <DriverRowActions :driver="row.original" />
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
