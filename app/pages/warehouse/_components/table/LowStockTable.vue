<script setup lang="ts">
import { getPaginationRowModel } from "@tanstack/vue-table";
import type { TableColumn } from "@nuxt/ui";
import type { Product } from "~/types/product";
import { formatNumber } from "~/utils/format";
import LowStockRowActions from "./LowStockRowActions.vue";

type BadgeColor =
  | "primary"
  | "secondary"
  | "success"
  | "info"
  | "warning"
  | "error"
  | "neutral";

type StatusMeta = { label: string; tone: BadgeColor };

const table = useTemplateRef("table");

const props = defineProps<{
  products: Product[];
  warehouseFor: (productId: string) => string;
  statusFor: (product: Product) => StatusMeta;
}>();

const columns: TableColumn<Product>[] = [
  { id: "product", header: "Product", accessorFn: (row) => row.name ?? "" },
  { id: "sku", header: "SKU", accessorFn: (row) => row.sku ?? "" },
  { id: "stock", header: "Stock", accessorFn: (row) => row.stock_quantity ?? 0 },
  {
    id: "minimum",
    header: "Minimum",
    accessorFn: (row) => row.minimum_stock_quantity ?? 0,
  },
  {
    id: "warehouse",
    header: "Warehouse",
    accessorFn: (row) => (row.id ? props.warehouseFor(row.id) : ""),
  },
  {
    id: "status",
    header: "Status",
    accessorFn: (row) => props.statusFor(row).label,
  },
  { id: "actions", header: "" },
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
          Low Stock Alerts
        </p>
        <p class="mt-1 text-lg font-semibold">Items requiring attention</p>
      </div>
    </div>

    <UTable
      ref="table"
      v-model:pagination="pagination"
      :data="props.products"
      :columns="columns"
      class="text-sm"
      :pagination-options="{ getPaginationRowModel: getPaginationRowModel() }"
    >
      <template #product-cell="{ row }">
        <div class="flex flex-col">
          <span class="font-medium">
            {{ row.original.name ?? row.original.id }}
          </span>
          <span class="text-xs text-slate-500">
            {{ row.original.sku ?? "No SKU" }}
          </span>
        </div>
      </template>
      <template #stock-cell="{ row }">
        <span class="font-medium text-warning-600">
          {{ formatNumber(row.original.stock_quantity ?? 0) }}
        </span>
      </template>
      <template #minimum-cell="{ row }">
        <span class="text-slate-600">
          {{ formatNumber(row.original.minimum_stock_quantity ?? 0) }}
        </span>
      </template>
      <template #warehouse-cell="{ row }">
        <span class="text-slate-600">
          {{ row.original.id ? props.warehouseFor(row.original.id) : "" }}
        </span>
      </template>
      <template #status-cell="{ row }">
        <UBadge :color="props.statusFor(row.original).tone" variant="subtle">
          {{ props.statusFor(row.original).label }}
        </UBadge>
      </template>
      <template #actions-cell="{ row }">
        <div class="flex justify-end">
          <LowStockRowActions
            :product="row.original"
            :warehouse="row.original.id ? props.warehouseFor(row.original.id) : ''"
          />
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
