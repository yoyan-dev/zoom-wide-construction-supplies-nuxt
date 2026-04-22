<script setup lang="ts">
import type { TableColumn } from "@nuxt/ui";
import type { PaginationMeta } from "~/types/pagination";
import type { Supplier } from "~/types/supplier";
import { formatShortDateOrFallback } from "~/utils/format";
import AdminTableEmptyState from "../../../_components/AdminTableEmptyState.vue";
import AdminServerPagination from "../../../_components/AdminServerPagination.vue";
import {
  getSupplierStatusColor,
  getSupplierStatusLabel,
  isMatchingSupplierStatusFilter,
} from "../supplier-options";
import SupplierRowActions from "./SupplierRowActions.vue";

const props = defineProps<{
  suppliers: Supplier[];
  search: string;
  status: string;
  isLoading: boolean;
  pagination: PaginationMeta;
}>();

const emit = defineEmits<{
  (event: "page-change", page: number): void;
}>();

const filteredSuppliers = computed(() =>
  props.suppliers.filter((supplier) =>
    isMatchingSupplierStatusFilter(supplier, props.status),
  ),
);

const hasRows = computed(() => filteredSuppliers.value.length > 0);
const hasSearch = computed(() => props.search.trim().length > 0);
const hasStatusFilter = computed(() => props.status !== "all");

const emptyTitle = computed(() =>
  hasSearch.value || hasStatusFilter.value
    ? "No suppliers match the current filters"
    : "No suppliers yet",
);

const emptyDescription = computed(() =>
  hasSearch.value || hasStatusFilter.value
    ? "Try a different search term or status."
    : "Create a supplier profile to manage procurement contacts and supplier-role sign-ins.",
);

const columns: TableColumn<Supplier>[] = [
  {
    id: "supplier",
    header: "Supplier",
    accessorFn: (row) => row.business_name,
  },
  {
    id: "contact",
    header: "Contact",
    accessorFn: (row) => row.contact_person,
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
      :data="filteredSuppliers"
      :columns="columns"
      class="text-sm"
      :loading="props.isLoading"
    >
      <template #supplier-cell="{ row }">
        <div class="flex flex-col">
          <NuxtLink
            :to="`/admin/suppliers/${row.original.id}`"
            class="font-medium text-slate-900 transition hover:text-primary"
          >
            {{ row.original.business_name }}
          </NuxtLink>
          <span class="text-xs text-slate-500">
            Supplier ID {{ row.original.id }}
          </span>
        </div>
      </template>

      <template #contact-cell="{ row }">
        <div class="flex flex-col">
          <span class="text-slate-700">{{ row.original.contact_person }}</span>
          <span class="text-xs text-slate-500">
            {{ row.original.email }}
          </span>
          <span class="text-xs text-slate-500">
            {{ row.original.phone ?? "No phone number" }}
          </span>
        </div>
      </template>

      <template #status-cell="{ row }">
        <div class="flex flex-col gap-1">
          <UBadge
            :color="getSupplierStatusColor(row.original.is_active)"
            variant="subtle"
          >
            {{ getSupplierStatusLabel(row.original.is_active) }}
          </UBadge>
          <span class="text-xs text-slate-500">
            Supplier account
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
          <SupplierRowActions :supplier="row.original" />
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
