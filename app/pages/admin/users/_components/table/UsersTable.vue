<script setup lang="ts">
import { getPaginationRowModel } from "@tanstack/vue-table";
import type { TableColumn } from "@nuxt/ui";
import type { User } from "~/types/user";
import { formatShortDateOrFallback } from "~/utils/format";
import AdminTableEmptyState from "../../../_components/AdminTableEmptyState.vue";
import UserRowActions from "./UserRowActions.vue";
import {
  getInternalUserRoleLabel,
  getUserStatusColor,
  getUserStatusLabel,
  isMatchingStatusFilter,
} from "../internal-user-options";

const table = useTemplateRef("table");

const props = defineProps<{
  users: User[];
  search: string;
  role: string;
  status: string;
  isLoading: boolean;
}>();

const filteredUsers = computed(() =>
  props.users.filter((user) => {
    const matchesRole = props.role === "all" || user.role === props.role;
    const matchesStatus = isMatchingStatusFilter(user, props.status);
    return matchesRole && matchesStatus;
  }),
);

const hasRows = computed(() => filteredUsers.value.length > 0);
const hasSearch = computed(() => props.search.trim().length > 0);
const hasRoleFilter = computed(() => props.role !== "all");
const hasStatusFilter = computed(() => props.status !== "all");

const emptyTitle = computed(() =>
  hasSearch.value || hasRoleFilter.value || hasStatusFilter.value
    ? "No internal users match the current filters"
    : "No internal users yet",
);

const emptyDescription = computed(() =>
  hasSearch.value || hasRoleFilter.value || hasStatusFilter.value
    ? "Try a different search term, role, or status."
    : "Create an internal account for admins, managers, staff, warehouse, finance, suppliers, or auditors.",
);

const columns: TableColumn<User>[] = [
  {
    id: "user",
    header: "User",
    accessorFn: (row) => row.full_name,
  },
  {
    id: "role",
    header: "Role",
    accessorFn: (row) => row.role,
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
      :data="filteredUsers"
      :columns="columns"
      class="text-sm"
      :pagination-options="{
        getPaginationRowModel: getPaginationRowModel(),
      }"
      :loading="props.isLoading"
    >
      <template #user-cell="{ row }">
        <div class="flex flex-col">
          <NuxtLink
            :to="`/admin/users/${row.original.id}`"
            class="font-medium text-slate-900 transition hover:text-primary"
          >
            {{ row.original.full_name }}
          </NuxtLink>
          <span class="text-xs text-slate-500">
            {{ row.original.email }}
          </span>
          <span v-if="row.original.phone" class="text-xs text-slate-500">
            {{ row.original.phone }}
          </span>
        </div>
      </template>

      <template #role-cell="{ row }">
        <UBadge color="primary" variant="subtle">
          {{ getInternalUserRoleLabel(row.original.role) }}
        </UBadge>
      </template>

      <template #status-cell="{ row }">
        <div class="flex flex-col gap-1">
          <UBadge
            :color="getUserStatusColor(row.original.is_active)"
            variant="subtle"
          >
            {{ getUserStatusLabel(row.original.is_active) }}
          </UBadge>
          <span class="text-xs text-slate-500">
            {{ row.original.id }}
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
          <UserRowActions :user="row.original" />
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
