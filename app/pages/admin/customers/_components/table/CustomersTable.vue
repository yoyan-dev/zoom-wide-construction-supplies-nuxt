<script setup lang="ts">
import type { TableColumn } from "@nuxt/ui";
import type { Customer } from "~/types/customer";
import type { PaginationMeta } from "~/types/pagination";
import { formatShortDateOrFallback } from "~/utils/format";
import AdminTableEmptyState from "../../../_components/AdminTableEmptyState.vue";
import AdminServerPagination from "../../../_components/AdminServerPagination.vue";
import CustomerRowActions from "./CustomerRowActions.vue";

const props = defineProps<{
  customers: Customer[];
  search: string;
  accountStatus: string;
  isLoading: boolean;
  detailBasePath: string;
  pagination: PaginationMeta;
}>();

const emit = defineEmits<{
  (event: "page-change", page: number): void;
}>();

const filteredCustomers = computed(() =>
  props.customers.filter((customer) => {
    if (props.accountStatus === "linked") {
      return Boolean(customer.user_id);
    }

    if (props.accountStatus === "unlinked") {
      return !customer.user_id;
    }

    return true;
  }),
);

const hasRows = computed(() => filteredCustomers.value.length > 0);
const hasSearch = computed(() => props.search.trim().length > 0);
const hasAccountFilter = computed(() => props.accountStatus !== "all");

const emptyTitle = computed(() =>
  hasSearch.value || hasAccountFilter.value
    ? "No customers match the current filters"
    : "No customers yet",
);

const emptyDescription = computed(() =>
  hasSearch.value || hasAccountFilter.value
    ? "Try a different search term or account filter."
    : "Customer records appear here when they are available in the system.",
);

const columns: TableColumn<Customer>[] = [
  {
    id: "company",
    header: "Customer",
    accessorFn: (row) => row.company_name,
  },
  {
    id: "contact",
    header: "Contact",
    accessorFn: (row) => row.contact_name,
  },
  {
    id: "account",
    header: "Account",
    accessorFn: (row) => row.user_id ?? "",
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
      :data="filteredCustomers"
      :columns="columns"
      class="text-sm"
      :loading="props.isLoading"
    >
      <template #company-cell="{ row }">
        <div class="flex flex-col">
          <NuxtLink
            :to="`${props.detailBasePath}/${row.original.id}`"
            class="font-medium text-slate-900 transition hover:text-primary"
          >
            {{ row.original.company_name }}
          </NuxtLink>
          <span class="text-xs text-slate-500">
            {{
              row.original.user_id
                ? "Online account linked"
                : "Customer profile only"
            }}
          </span>
        </div>
      </template>
      <template #contact-cell="{ row }">
        <div class="flex flex-col">
          <span class="text-slate-700">{{ row.original.contact_name }}</span>
          <span class="text-xs text-slate-500">
            {{ row.original.email }}
            <template v-if="row.original.phone">
              - {{ row.original.phone }}
            </template>
          </span>
        </div>
      </template>
      <template #account-cell="{ row }">
        <UBadge
          :color="row.original.user_id ? 'success' : 'neutral'"
          variant="subtle"
        >
          {{ row.original.user_id ? "Linked account" : "No linked account" }}
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
          <CustomerRowActions
            :customer="row.original"
            :detail-base-path="props.detailBasePath"
          />
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
