<script setup lang="ts">
import { getPaginationRowModel } from "@tanstack/vue-table";
import type { TableColumn } from "@nuxt/ui";
import type { WarehouseTransfer } from "~/types/warehouse-transfer";
import type { Product } from "~/types/product";
import { formatNumber, formatShortDate } from "~/utils/format";
import AdminTransferRowActions from "./AdminTransferRowActions.vue";

type BadgeColor =
  | "primary"
  | "secondary"
  | "success"
  | "info"
  | "warning"
  | "error"
  | "neutral";

const table = useTemplateRef("table");
const props = defineProps<{
  transfers: WarehouseTransfer[];
  products: Product[];
}>();

const productMap = computed(() => {
  const map: Record<string, Product> = {};
  for (const product of props.products) {
    if (!product.id) continue;
    map[product.id] = product;
  }
  return map;
});

const statusTone: Record<WarehouseTransfer["status"], BadgeColor> = {
  pending: "warning",
  approved: "info",
  in_transit: "primary",
  received: "success",
  cancelled: "neutral",
};

const columns: TableColumn<WarehouseTransfer>[] = [
  { id: "transfer", header: "Transfer ID", accessorFn: (row) => row.id },
  { id: "product", header: "Product", accessorFn: (row) => row.product_id },
  {
    id: "source",
    header: "Source Warehouse",
    accessorFn: (row) => row.source_warehouse,
  },
  {
    id: "destination",
    header: "Destination Warehouse",
    accessorFn: (row) => row.destination_warehouse,
  },
  { id: "quantity", header: "Quantity", accessorFn: (row) => row.quantity },
  { id: "status", header: "Status", accessorFn: (row) => row.status },
  { id: "created", header: "Created Date", accessorFn: (row) => row.created_at },
  { id: "actions", header: "" },
];

const pagination = ref({
  pageIndex: 0,
  pageSize: 6,
});
</script>

<template>
  <UCard>
    <UTable
      ref="table"
      v-model:pagination="pagination"
      :data="props.transfers"
      :columns="columns"
      class="text-sm"
      :pagination-options="{
        getPaginationRowModel: getPaginationRowModel(),
      }"
    >
      <template #transfer-cell="{ row }">
        <span class="font-medium">{{ row.original.id }}</span>
      </template>
      <template #product-cell="{ row }">
        <div class="flex flex-col">
          <span class="font-medium">
            {{ productMap[row.original.product_id]?.name ?? row.original.product_id }}
          </span>
          <span class="text-xs text-slate-500">
            {{ productMap[row.original.product_id]?.sku ?? "No SKU" }}
          </span>
        </div>
      </template>
      <template #source-cell="{ row }">
        <span class="text-slate-600">{{ row.original.source_warehouse }}</span>
      </template>
      <template #destination-cell="{ row }">
        <span class="text-slate-600">{{ row.original.destination_warehouse }}</span>
      </template>
      <template #quantity-cell="{ row }">
        <span class="font-medium">{{ formatNumber(row.original.quantity) }}</span>
      </template>
      <template #status-cell="{ row }">
        <UBadge :color="statusTone[row.original.status]" variant="subtle">
          {{ row.original.status.replace('_', ' ') }}
        </UBadge>
      </template>
      <template #created-cell="{ row }">
        <span class="text-slate-600">
          {{ formatShortDate(row.original.created_at) }}
        </span>
      </template>
      <template #actions-cell="{ row }">
        <div class="flex justify-end">
          <AdminTransferRowActions :transfer="row.original" />
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