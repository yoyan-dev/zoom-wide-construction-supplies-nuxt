<script setup lang="ts">
import type { TableColumn } from "@nuxt/ui";
import type { Driver } from "~/types/driver";
import type { PaginationMeta } from "~/types/pagination";
import { formatShortDateOrFallback } from "~/utils/format";
import AdminTableEmptyState from "../../../_components/AdminTableEmptyState.vue";
import AdminServerPagination from "../../../_components/AdminServerPagination.vue";
import DriverRowActions from "./DriverRowActions.vue";
import {
  getDriverStatusColor,
  getDriverStatusLabel,
  isMatchingDriverStatusFilter,
} from "../driver-options";

const props = defineProps<{
  drivers: Driver[];
  search: string;
  status: string;
  isLoading: boolean;
  pagination: PaginationMeta;
}>();

const emit = defineEmits<{
  (event: "page-change", page: number): void;
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

</script>

<template>
  <UCard>
    <UTable
      v-if="props.isLoading || hasRows"
      :data="filteredDrivers"
      :columns="columns"
      class="text-sm"
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

    <AdminServerPagination
      v-if="hasRows"
      :pagination="props.pagination"
      @page-change="emit('page-change', $event)"
    />
  </UCard>
</template>
