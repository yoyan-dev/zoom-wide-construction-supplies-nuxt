<script setup lang="ts">
import type { TableColumn } from "@nuxt/ui";
import type { PaginationMeta } from "~/types/pagination";
import type { User } from "~/types/user";
import { formatShortDateOrFallback } from "~/utils/format";
import AdminTableEmptyState from "../../../_components/AdminTableEmptyState.vue";
import AdminServerPagination from "../../../_components/AdminServerPagination.vue";
import UserRowActions from "./UserRowActions.vue";
import {
  getInternalUserRoleLabel,
  getUserStatusColor,
  getUserStatusLabel,
  isMatchingStatusFilter,
} from "../internal-user-options";

const props = defineProps<{
  users: User[];
  search: string;
  role: string;
  status: string;
  isLoading: boolean;
  pagination: PaginationMeta;
}>();

const emit = defineEmits<{
  (event: "page-change", page: number): void;
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

</script>

<template>
  <UCard>
    <UTable
      v-if="props.isLoading || hasRows"
      :data="filteredUsers"
      :columns="columns"
      class="text-sm"
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
            Internal account
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

    <AdminServerPagination
      v-if="hasRows"
      :pagination="props.pagination"
      @page-change="emit('page-change', $event)"
    />
  </UCard>
</template>
