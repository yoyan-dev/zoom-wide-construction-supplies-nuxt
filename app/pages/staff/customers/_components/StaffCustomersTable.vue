<script setup lang="ts">
import { getPaginationRowModel } from "@tanstack/vue-table";
import type { TableColumn } from "@nuxt/ui";
import type { Customer } from "~/types/customer";
import type { Order } from "~/types/order";
import { formatShortDate } from "~/utils/format";

const props = defineProps<{
  customers: Customer[];
  orderCountByCustomer: Record<string, number>;
  latestOrderByCustomer: Record<string, Order | undefined>;
}>();

const table = useTemplateRef("table");

const columns: TableColumn<Customer>[] = [
  { id: "company", header: "Company", accessorFn: (row) => row.company_name },
  { id: "contact", header: "Primary Contact", accessorFn: (row) => row.contact_name },
  { id: "orders", header: "Orders", accessorFn: (row) => props.orderCountByCustomer[row.id] ?? 0 },
  { id: "latest", header: "Latest Order", accessorFn: (row) => props.latestOrderByCustomer[row.id]?.id ?? "" },
  { id: "updated", header: "Updated", accessorFn: (row) => row.updated_at },
];

const pagination = ref({
  pageIndex: 0,
  pageSize: 6,
});
</script>

<template>
  <UCard>
    <div class="mb-4 flex flex-wrap items-center justify-between gap-3">
      <div>
        <p class="text-xs uppercase tracking-[0.18em] text-slate-500">
          Customer Directory
        </p>
        <p class="mt-1 text-lg font-semibold">Account and order context</p>
      </div>
      <UBadge color="info" variant="subtle">
        {{ props.customers.length }} customer records
      </UBadge>
    </div>

    <UTable
      ref="table"
      v-model:pagination="pagination"
      :data="props.customers"
      :columns="columns"
      class="text-sm"
      :pagination-options="{ getPaginationRowModel: getPaginationRowModel() }"
    >
      <template #company-cell="{ row }">
        <div class="flex flex-col">
          <span class="font-medium text-slate-900">{{ row.original.company_name }}</span>
          <span class="text-xs text-slate-500">
            {{ row.original.shipping_address ?? row.original.billing_address ?? "Address pending" }}
          </span>
        </div>
      </template>

      <template #contact-cell="{ row }">
        <div class="flex flex-col">
          <span class="text-slate-700">{{ row.original.contact_name }}</span>
          <span class="text-xs text-slate-500">
            {{ row.original.phone ?? row.original.email }}
          </span>
        </div>
      </template>

      <template #orders-cell="{ row }">
        <span class="font-medium text-slate-900">
          {{ props.orderCountByCustomer[row.original.id] ?? 0 }}
        </span>
      </template>

      <template #latest-cell="{ row }">
        <div class="flex flex-col">
          <span class="text-slate-700">
            {{ props.latestOrderByCustomer[row.original.id]?.id ?? "No orders yet" }}
          </span>
          <span class="text-xs text-slate-500">
            {{
              props.latestOrderByCustomer[row.original.id]?.status ?? "No status"
            }}
          </span>
        </div>
      </template>

      <template #updated-cell="{ row }">
        <span class="text-slate-600">
          {{ formatShortDate(row.original.updated_at) }}
        </span>
      </template>
    </UTable>

    <div class="flex justify-end border-t border-default px-4 pt-4">
      <UPagination
        :page="(table?.tableApi?.getState().pagination.pageIndex || 0) + 1"
        :items-per-page="table?.tableApi?.getState().pagination.pageSize"
        :total="table?.tableApi?.getFilteredRowModel().rows.length"
        @update:page="(page) => table?.tableApi?.setPageIndex(page - 1)"
      />
    </div>
  </UCard>
</template>
