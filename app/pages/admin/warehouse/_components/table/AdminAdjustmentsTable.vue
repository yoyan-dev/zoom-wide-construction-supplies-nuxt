<script setup lang="ts">
import { getPaginationRowModel } from "@tanstack/vue-table";
import type { TableColumn } from "@nuxt/ui";
import type { InventoryLog } from "~/types/inventory";
import type { Product } from "~/types/product";
import { formatNumber, formatShortDate } from "~/utils/format";
import AdminAdjustmentRowActions from "./AdminAdjustmentRowActions.vue";

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
  logs: InventoryLog[];
  products: Product[];
  warehouseFor: (productId: string) => string;
}>();

const productMap = computed(() => {
  const map: Record<string, Product> = {};
  for (const product of props.products) {
    if (!product.id) continue;
    map[product.id] = product;
  }
  return map;
});

const typeFor = (log: InventoryLog) => {
  if (log.movement_type === "adjustment") return "Adjustment";
  if (log.movement_type === "in") return "Increase";
  if (log.movement_type === "out") return "Decrease";
  return log.movement_type;
};

const typeTone: Record<string, BadgeColor> = {
  Adjustment: "info",
  Increase: "success",
  Decrease: "warning",
};

const columns: TableColumn<InventoryLog>[] = [
  { id: "product", header: "Product", accessorFn: (row) => row.product_id },
  {
    id: "warehouse",
    header: "Warehouse",
    accessorFn: (row) => props.warehouseFor(row.product_id),
  },
  {
    id: "type",
    header: "Adjustment Type",
    accessorFn: (row) => typeFor(row),
  },
  {
    id: "quantity",
    header: "Quantity",
    accessorFn: (row) => row.quantity_change,
  },
  { id: "reason", header: "Reason", accessorFn: (row) => row.note ?? "" },
  {
    id: "adjustedBy",
    header: "Adjusted By",
    accessorFn: (row) => row.created_by ?? "",
  },
  { id: "date", header: "Date", accessorFn: (row) => row.created_at },
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
      :data="props.logs"
      :columns="columns"
      class="text-sm"
      :pagination-options="{
        getPaginationRowModel: getPaginationRowModel(),
      }"
    >
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
      <template #warehouse-cell="{ row }">
        <span class="text-slate-600">
          {{ props.warehouseFor(row.original.product_id) }}
        </span>
      </template>
      <template #type-cell="{ row }">
        <UBadge
          :color="typeTone[typeFor(row.original)] ?? 'neutral'"
          variant="subtle"
        >
          {{ typeFor(row.original) }}
        </UBadge>
      </template>
      <template #quantity-cell="{ row }">
        <span class="font-medium">
          {{ formatNumber(row.original.quantity_change) }}
        </span>
      </template>
      <template #reason-cell="{ row }">
        <span class="text-slate-600">
          {{ row.original.note ?? "No notes" }}
        </span>
      </template>
      <template #adjustedBy-cell="{ row }">
        <span class="text-slate-600">
          {{ row.original.created_by ?? "System" }}
        </span>
      </template>
      <template #date-cell="{ row }">
        <span class="text-slate-600">
          {{ formatShortDate(row.original.created_at) }}
        </span>
      </template>
      <template #actions-cell="{ row }">
        <div class="flex justify-end">
          <AdminAdjustmentRowActions
            :log="row.original"
            :product-name="productMap[row.original.product_id]?.name ?? row.original.product_id"
            :warehouse="props.warehouseFor(row.original.product_id)"
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