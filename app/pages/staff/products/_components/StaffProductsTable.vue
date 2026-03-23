<script setup lang="ts">
import { getPaginationRowModel } from "@tanstack/vue-table";
import type { TableColumn } from "@nuxt/ui";
import type { Product } from "~/types/product";
import { formatCurrency, formatNumber, formatShortDate } from "~/utils/format";

type BadgeColor =
  | "primary"
  | "secondary"
  | "success"
  | "info"
  | "warning"
  | "error"
  | "neutral";

const props = defineProps<{
  products: Product[];
}>();

const table = useTemplateRef("table");

const columns: TableColumn<Product>[] = [
  { id: "product", header: "Product", accessorFn: (row) => row.name ?? "" },
  { id: "warehouse", header: "Warehouse", accessorFn: (row) => row.warehouse?.name ?? "" },
  { id: "price", header: "Price", accessorFn: (row) => row.price ?? 0 },
  { id: "stock", header: "Stock", accessorFn: (row) => row.stock_quantity ?? 0 },
  { id: "status", header: "Status", accessorFn: (row) => row.is_active ?? false },
  { id: "updated", header: "Updated", accessorFn: (row) => row.updated_at ?? "" },
];

const pagination = ref({
  pageIndex: 0,
  pageSize: 6,
});

const stockBadge = (product: Product): { color: BadgeColor; label: string } => {
  const stock = product.stock_quantity ?? 0;
  const minimum = product.minimum_stock_quantity ?? 0;
  if (stock === 0) return { color: "error", label: "Out of stock" };
  if (minimum > 0 && stock <= minimum) return { color: "warning", label: "Low stock" };
  return { color: "success", label: "Healthy" };
};
</script>

<template>
  <UCard>
    <div class="mb-4 flex flex-wrap items-center justify-between gap-3">
      <div>
        <p class="text-xs uppercase tracking-[0.18em] text-slate-500">
          Product Directory
        </p>
        <p class="mt-1 text-lg font-semibold">Catalog and stock view</p>
      </div>
      <UBadge color="warning" variant="subtle">
        {{
          props.products.filter((product) => stockBadge(product).label !== "Healthy").length
        }}
        alerts
      </UBadge>
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
          <span class="font-medium text-slate-900">{{ row.original.name }}</span>
          <span class="text-xs text-slate-500">
            {{ row.original.sku }} · {{ row.original.category?.name ?? "No category" }}
          </span>
        </div>
      </template>

      <template #warehouse-cell="{ row }">
        <div class="flex flex-col">
          <span class="text-slate-700">
            {{ row.original.warehouse?.name ?? "Unassigned" }}
          </span>
          <span class="text-xs text-slate-500">
            {{ row.original.unit ?? "unit" }}
          </span>
        </div>
      </template>

      <template #price-cell="{ row }">
        <span class="font-medium">{{ formatCurrency(row.original.price ?? 0) }}</span>
      </template>

      <template #stock-cell="{ row }">
        <div class="flex flex-col">
          <span class="font-medium">
            {{ formatNumber(row.original.stock_quantity ?? 0) }}
            {{ row.original.unit }}
          </span>
          <span class="text-xs text-slate-500">
            Min {{ formatNumber(row.original.minimum_stock_quantity ?? 0) }}
          </span>
        </div>
      </template>

      <template #status-cell="{ row }">
        <div class="flex flex-col gap-2">
          <UBadge :color="row.original.is_active ? 'success' : 'neutral'" variant="subtle">
            {{ row.original.is_active ? "Active" : "Inactive" }}
          </UBadge>
          <UBadge :color="stockBadge(row.original).color" variant="subtle">
            {{ stockBadge(row.original).label }}
          </UBadge>
        </div>
      </template>

      <template #updated-cell="{ row }">
        <span class="text-slate-600">
          {{ row.original.updated_at ? formatShortDate(row.original.updated_at) : "_" }}
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
