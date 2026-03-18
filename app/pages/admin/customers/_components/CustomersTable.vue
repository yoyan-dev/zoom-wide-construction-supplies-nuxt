<script setup lang="ts">
import { getPaginationRowModel } from "@tanstack/vue-table";
import type { TableColumn } from "@nuxt/ui";
import type { Customer } from "~/types/customer";
import { formatShortDate } from "~/utils/format";

const table = useTemplateRef("table");
const props = defineProps<{
  customers: Customer[];
}>();

const columns: TableColumn<Customer>[] = [
  {
    id: "company",
    header: "Company",
    accessorFn: (row) => row.company_name,
  },
  {
    id: "contact",
    header: "Primary Contact",
    accessorFn: (row) => row.contact_name,
  },
  {
    id: "email",
    header: "Email",
    accessorFn: (row) => row.email,
  },
  {
    id: "created",
    header: "Joined",
    accessorFn: (row) => row.created_at,
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
          Customer Directory
        </p>
        <p class="mt-1 text-lg font-semibold">Customer overview</p>
      </div>
      <UButton color="neutral" variant="ghost" icon="i-lucide-filter">
        Filters
      </UButton>
    </div>

    <UTable
      ref="table"
      v-model:pagination="pagination"
      :data="props.customers"
      :columns="columns"
      class="text-sm"
      :pagination-options="{
        getPaginationRowModel: getPaginationRowModel(),
      }"
    >
      <template #company-cell="{ row }">
        <div class="flex flex-col">
          <span class="font-medium">{{ row.original.company_name }}</span>
          <span class="text-xs text-slate-500">{{ row.original.id }}</span>
        </div>
      </template>
      <template #contact-cell="{ row }">
        <div class="flex flex-col">
          <span class="text-slate-700">{{ row.original.contact_name }}</span>
          <span class="text-xs text-slate-500">
            {{ row.original.phone ?? "No phone" }}
          </span>
        </div>
      </template>
      <template #email-cell="{ row }">
        <span class="text-slate-600">{{ row.original.email }}</span>
      </template>
      <template #created-cell="{ row }">
        <span class="text-slate-600">
          {{ formatShortDate(row.original.created_at) }}
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
