<script setup lang="ts">
import type { TableColumn } from "@nuxt/ui";
import type { InventoryLog } from "~/types/inventory";
import type { PaginationMeta } from "~/types/pagination";
import type { Product } from "~/types/product";
import type { Warehouse } from "~/types/warehouse";
import { formatNumber, formatShortDateOrFallback } from "~/utils/format";
import { buildInventoryBalanceMap } from "~/utils/inventory-balance";
import { getInventoryStockState } from "../shared/inventory-stock";
import AdminTableEmptyState from "../../../_components/AdminTableEmptyState.vue";
import AdminServerPagination from "../../../_components/AdminServerPagination.vue";
import InventoryRowActions from "./InventoryRowActions.vue";

const props = defineProps<{
  products: Product[];
  inventoryLogs: InventoryLog[];
  warehouses: Warehouse[];
  search: string;
  stockStatus: string;
  detailBasePath: string;
  productBasePath?: string;
  isLoading: boolean;
  pagination: PaginationMeta;
}>();

const emit = defineEmits<{
  (event: "page-change", page: number): void;
  (event: "movement-saved"): void;
}>();

const stockMap = computed(() =>
  buildInventoryBalanceMap(props.inventoryLogs, props.products),
);

const warehouseMap = computed(() => {
  const map: Record<string, string> = {};
  for (const warehouse of props.warehouses) {
    if (!warehouse.id) continue;
    map[warehouse.id] = warehouse.name;
  }
  return map;
});

const hasRows = computed(() => props.products.length > 0);
const hasSearch = computed(() => props.search.trim().length > 0);
const hasStockStatusFilter = computed(() => props.stockStatus !== "all");

const emptyTitle = computed(() =>
  hasSearch.value || hasStockStatusFilter.value
    ? "No inventory items match the current filters"
    : "No inventory items yet",
);

const emptyDescription = computed(() =>
  hasSearch.value || hasStockStatusFilter.value
    ? "Try a different search term or stock status filter."
    : "Products with stock visibility will appear here once they are available in the catalog.",
);

const columns: TableColumn<Product>[] = [
  {
    id: "product",
    header: "Product",
    accessorFn: (row) => row.name ?? "",
  },
  {
    id: "warehouse",
    header: "Warehouse",
    accessorFn: (row) => row.warehouse_id ?? "",
  },
  {
    id: "current",
    header: "Current stock",
    accessorFn: (row) => stockMap.value[row.id ?? ""] ?? 0,
  },
  {
    id: "minimum",
    header: "Minimum stock",
    accessorFn: (row) => row.minimum_stock_quantity ?? 0,
  },
  {
    id: "status",
    header: "Stock status",
    accessorFn: (row) => row.id ?? "",
  },
  {
    id: "updated",
    header: "Updated",
    accessorFn: (row) => row.updated_at ?? "",
  },
  {
    id: "actions",
    header: "",
  },
];

const stockBadge = (product: Product) =>
  getInventoryStockState(
    stockMap.value[product.id ?? ""] ?? 0,
    product.minimum_stock_quantity ?? 0,
  );
</script>

<template>
  <UCard>
    <UTable
      v-if="props.isLoading || hasRows"
      :data="props.products"
      :columns="columns"
      class="text-sm"
      :loading="props.isLoading"
    >
      <template #product-cell="{ row }">
        <div class="flex flex-col">
          <NuxtLink
            :to="`${props.detailBasePath}/${row.original.id}`"
            class="font-medium text-slate-900 transition hover:text-primary"
          >
            {{ row.original.name ?? "Unnamed product" }}
          </NuxtLink>
          <span class="text-xs text-slate-500">
            {{ row.original.sku ?? "No SKU" }}
            <template v-if="row.original.unit">
              | {{ row.original.unit }}
            </template>
          </span>
          <NuxtLink
            v-if="props.productBasePath && row.original.id"
            :to="`${props.productBasePath}/${row.original.id}`"
            class="text-xs text-primary transition hover:text-primary/80"
          >
            Open product details
          </NuxtLink>
        </div>
      </template>

      <template #warehouse-cell="{ row }">
        <div class="flex flex-col">
          <span class="font-medium text-slate-900">
            {{ warehouseMap[row.original.warehouse_id ?? ""] ?? "Unassigned" }}
          </span>
          <span class="text-xs text-slate-500">
            {{
              row.original.warehouse_id
                ? "Storage location assigned"
                : "No storage location assigned"
            }}
          </span>
        </div>
      </template>

      <template #current-cell="{ row }">
        <div class="flex flex-col">
          <span class="font-medium text-slate-900">
            {{ formatNumber(stockMap[row.original.id ?? ""] ?? 0) }}
            {{ row.original.unit ?? "" }}
          </span>
          <span class="text-xs text-slate-500">
            Catalog stock {{ formatNumber(row.original.stock_quantity ?? 0) }}
          </span>
        </div>
      </template>

      <template #minimum-cell="{ row }">
        <span class="font-medium text-slate-900">
          {{ formatNumber(row.original.minimum_stock_quantity ?? 0) }}
        </span>
      </template>

      <template #status-cell="{ row }">
        <UBadge :color="stockBadge(row.original).color" variant="subtle">
          {{ stockBadge(row.original).label }}
        </UBadge>
      </template>

      <template #updated-cell="{ row }">
        <div class="flex flex-col">
          <span class="font-medium text-slate-900">
            {{ formatShortDateOrFallback(row.original.updated_at, "_") }}
          </span>
          <span class="text-xs text-slate-500">
            {{ row.original.is_active ? "Active product" : "Inactive product" }}
          </span>
        </div>
      </template>

      <template #actions-cell="{ row }">
        <div class="flex justify-end">
          <InventoryRowActions
            :product="row.original"
            :detail-base-path="props.detailBasePath"
            :product-base-path="props.productBasePath"
            :on-movement-saved="() => emit('movement-saved')"
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
