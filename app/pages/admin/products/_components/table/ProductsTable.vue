<script setup lang="ts">
import type { TableColumn } from "@nuxt/ui";
import { getPaginationRowModel } from "@tanstack/vue-table";
import type { Category } from "~/types/category";
import type { InventoryLog } from "~/types/inventory";
import type { Product } from "~/types/product";
import type { Supplier } from "~/types/supplier";
import type { Warehouse } from "~/types/warehouse";
import {
  formatCurrency,
  formatNumber,
  formatShortDateOrFallback,
} from "~/utils/format";
import { buildInventoryBalanceMap } from "~/utils/inventory-balance";
import ProductRowActions from "./ProductRowActions.vue";
import ProductBulkDeleteModal from "../modals/ProductBulkDeleteModal.vue";
import { useModal } from "~/composables/admin/useModal";
import AdminTableEmptyState from "../../../_components/AdminTableEmptyState.vue";
import AdminTableSelectionBar from "../../../_components/AdminTableSelectionBar.vue";

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
  categories: Category[];
  suppliers: Supplier[];
  warehouses: Warehouse[];
  inventoryLogs: InventoryLog[];
  search: string;
  categoryId: string;
  stockStatus: string;
  status: string;
  isLoading: boolean;
}>();

const table = useTemplateRef("table");
const { openModal } = useModal();
const selectedIds = ref<Set<string>>(new Set());

const categoryMap = computed(() => {
  const map: Record<string, string> = {};
  for (const category of props.categories) {
    map[category.id] = category.name;
  }
  return map;
});

const supplierMap = computed(() => {
  const map: Record<string, string> = {};
  for (const supplier of props.suppliers) {
    if (!supplier.id) continue;
    map[supplier.id] = supplier.name ?? "Unknown supplier";
  }
  return map;
});

const warehouseMap = computed(() => {
  const map: Record<string, string> = {};
  for (const warehouse of props.warehouses) {
    if (!warehouse.id) continue;
    map[warehouse.id] = warehouse.name;
  }
  return map;
});

const stockMap = computed(() =>
  buildInventoryBalanceMap(props.inventoryLogs, props.products),
);

const filteredProducts = computed(() => {
  const query = props.search.trim().toLowerCase();
  return props.products.filter((product) => {
    const categoryMatch =
      props.categoryId === "all" || product.category_id === props.categoryId;
    const statusMatch =
      props.status === "all" ||
      (props.status === "active" && product.is_active) ||
      (props.status === "inactive" && !product.is_active);
    const currentStock = stockMap.value[product.id ?? ""] ?? 0;
    const stockMatch =
      props.stockStatus === "all" ||
      (props.stockStatus === "low" &&
        currentStock <= (product.minimum_stock_quantity ?? 0) &&
        currentStock > 0) ||
      (props.stockStatus === "out" && currentStock === 0) ||
      (props.stockStatus === "healthy" &&
        currentStock > (product.minimum_stock_quantity ?? 0));

    const supplierName = product.supplier_id
      ? (supplierMap.value[product.supplier_id] ?? "")
      : "";
    const productName = product.name?.toLowerCase() ?? "";
    const productSku = product.sku?.toLowerCase() ?? "";
    const searchMatch =
      !query ||
      productName.includes(query) ||
      productSku.includes(query) ||
      supplierName.toLowerCase().includes(query);

    return categoryMatch && statusMatch && stockMatch && searchMatch;
  });
});

const selectableIds = computed(() =>
  filteredProducts.value
    .map((product) => product.id)
    .filter((id): id is string => Boolean(id)),
);

const selectedCount = computed(() => selectedIds.value.size);
const hasRows = computed(() => filteredProducts.value.length > 0);

const allSelected = computed(
  () =>
    selectableIds.value.length > 0 &&
    selectableIds.value.every((id) => selectedIds.value.has(id)),
);

const toggleAll = (value: boolean | "indeterminate") => {
  const shouldSelect = value === true;
  const next = new Set(selectedIds.value);
  if (shouldSelect) {
    selectableIds.value.forEach((id) => next.add(id));
  } else {
    selectableIds.value.forEach((id) => next.delete(id));
  }
  selectedIds.value = next;
};

const toggleOne = (
  id: string | undefined,
  value: boolean | "indeterminate",
) => {
  if (!id) return;
  const shouldSelect = value === true;
  const next = new Set(selectedIds.value);
  if (shouldSelect) {
    next.add(id);
  } else {
    next.delete(id);
  }
  selectedIds.value = next;
};

const handleBulkDelete = async () => {
  if (!selectedIds.value.size) return;
  openModal(ProductBulkDeleteModal, {
    ids: Array.from(selectedIds.value),
    onDeleted: () => {
      selectedIds.value = new Set();
    },
  });
};

watch(selectableIds, (ids) => {
  const next = new Set<string>();
  for (const id of ids) {
    if (selectedIds.value.has(id)) next.add(id);
  }
  selectedIds.value = next;
});

const columns: TableColumn<Product>[] = [
  { id: "select", header: "" },
  { id: "image", header: "", accessorFn: (row) => row.image_url ?? "" },
  { id: "sku", header: "SKU", accessorFn: (row) => row.sku },
  { id: "name", header: "Product", accessorFn: (row) => row.name },

  { id: "category", header: "Category", accessorFn: (row) => row.category_id },
  { id: "warehouse", header: "Warehouse", accessorFn: (row) => row.warehouse_id ?? "" },
  { id: "price", header: "Price", accessorFn: (row) => row.price },
  {
    id: "stock",
    header: "Stock",
    accessorFn: (row) => stockMap.value[row.id ?? ""] ?? 0,
  },
  { id: "status", header: "Status", accessorFn: (row) => row.is_active },
  { id: "updated", header: "Updated", accessorFn: (row) => row.updated_at },
  { id: "actions", header: "" },
];

const stockBadge = (product: Product): { color: BadgeColor; label: string } => {
  const currentStock = stockMap.value[product.id ?? ""] ?? 0;
  if (currentStock === 0) {
    return { color: "error", label: "Out of stock" };
  }
  if (currentStock <= (product.minimum_stock_quantity ?? 0)) {
    return { color: "warning", label: "Low stock" };
  }
  return { color: "success", label: "Healthy" };
};

const statusBadge = (product: Product): { color: BadgeColor; label: string } =>
  product.is_active
    ? { color: "success", label: "Active" }
    : { color: "neutral", label: "Inactive" };

const pagination = ref({
  pageIndex: 0,
  pageSize: 5,
});

const productInitials = (name?: string) => {
  if (!name) return "NA";
  const parts = name.trim().split(/\s+/).filter(Boolean);
  const firstPart = parts[0] ?? "";
  if (parts.length === 1) return firstPart.slice(0, 2).toUpperCase();
  return `${parts[0]?.[0] ?? ""}${parts[1]?.[0] ?? ""}`.toUpperCase() || "NA";
};
</script>

<template>
  <UCard>
    <AdminTableSelectionBar
      v-if="selectedCount"
      :count="selectedCount"
      item-label="products"
      @action="handleBulkDelete"
    />

    <UTable
      v-if="props.isLoading || hasRows"
      ref="table"
      v-model:pagination="pagination"
      :data="filteredProducts"
      :columns="columns"
      class="text-sm"
      :pagination-options="{
        getPaginationRowModel: getPaginationRowModel(),
      }"
      :loading="props.isLoading"
    >
      <template #select-header>
        <div class="flex items-center justify-center">
          <UCheckbox
            :model-value="allSelected"
            @update:model-value="toggleAll"
          />
        </div>
      </template>
      <template #select-cell="{ row }">
        <div class="flex items-center justify-center">
          <UCheckbox
            :model-value="selectedIds.has(row.original.id ?? '')"
            :disabled="!row.original.id"
            @update:model-value="toggleOne(row.original.id, $event)"
          />
        </div>
      </template>
      <template #image-cell="{ row }">
        <div class="flex items-center">
          <div
            class="h-10 w-10 overflow-hidden rounded-lg bg-slate-100 text-slate-500"
          >
            <img
              v-if="row.original.image_url"
              :src="row.original.image_url"
              :alt="row.original.name ?? 'Product image'"
              class="h-full w-full object-cover"
            />
            <span
              v-else
              class="flex h-full w-full items-center justify-center text-[10px] font-medium"
            >
              {{ productInitials(row.original.name) }}
            </span>
          </div>
        </div>
      </template>
      <template #sku-cell="{ row }">
        <span class="font-medium">{{ row.original.sku }}</span>
      </template>
      <template #name-cell="{ row }">
        <div class="flex flex-col">
          <span class="font-medium">{{ row.original.name }}</span>
          <span class="text-xs text-slate-500">
            {{ supplierMap[row.original.supplier_id ?? ""] ?? "No supplier" }}
          </span>
        </div>
      </template>
      <template #category-cell="{ row }">
        <div class="flex flex-col">
          <span class="text-slate-700">
            {{
              row.original.category_id
                ? categoryMap[row.original.category_id]
                : "Unassigned"
            }}
          </span>
          <span class="text-xs text-slate-500">
            {{ row.original.unit ?? "unit" }}
          </span>
        </div>
      </template>
      <template #warehouse-cell="{ row }">
        <span class="text-slate-600">
          {{ warehouseMap[row.original.warehouse_id ?? ""] ?? "Unassigned" }}
        </span>
      </template>
      <template #price-cell="{ row }">
        <span class="font-medium">
          {{ formatCurrency(row.original.price ?? 0) }}
        </span>
      </template>
      <template #stock-cell="{ row }">
        <div class="flex flex-col">
          <span class="font-medium">
            {{ formatNumber(stockMap[row.original.id ?? ""] ?? 0) }}
            {{ row.original.unit }}
          </span>
          <span class="text-xs text-slate-500">
            Min
            {{
              row.original.minimum_stock_quantity
                ? formatNumber(row.original.minimum_stock_quantity)
                : "_"
            }}
          </span>
        </div>
      </template>
      <template #status-cell="{ row }">
        <div class="flex flex-col gap-2">
          <UBadge :color="statusBadge(row.original).color" variant="subtle">
            {{ statusBadge(row.original).label }}
          </UBadge>
          <UBadge :color="stockBadge(row.original).color" variant="subtle">
            {{ stockBadge(row.original).label }}
          </UBadge>
        </div>
      </template>
      <template #updated-cell="{ row }">
        <span class="text-slate-600">
          {{ formatShortDateOrFallback(row.original.updated_at, "_") }}
        </span>
      </template>
      <template #actions-cell="{ row }">
        <ProductRowActions :product="row.original" />
      </template>
    </UTable>

    <AdminTableEmptyState
      v-else
      title="No products match the current filters"
      description="Adjust the search or filters, or add a new product to expand the catalog."
    />

    <div
      v-if="hasRows"
      class="flex justify-end border-t border-default pt-4 px-4"
    >
      <UPagination
        :page="(table?.tableApi?.getState().pagination.pageIndex || 0) + 1"
        :items-per-page="table?.tableApi?.getState().pagination.pageSize"
        :total="table?.tableApi?.getFilteredRowModel().rows.length"
        @update:page="(p) => table?.tableApi?.setPageIndex(p - 1)"
      />
    </div>
  </UCard>

  <!-- <ProductQuickEditModal
    :open="editOpen"
    :product="selectedProduct"
    :categories="props.categories"
    :suppliers="props.suppliers"
    @update:open="editOpen = $event"
  /> -->
</template>
