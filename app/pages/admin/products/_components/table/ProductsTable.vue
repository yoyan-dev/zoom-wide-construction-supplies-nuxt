<script setup lang="ts">
import type { TableColumn } from "@nuxt/ui";
import { getPaginationRowModel } from "@tanstack/vue-table";
import type { Category } from "~/types/category";
import type { Product } from "~/types/product";
import type { Supplier } from "~/types/supplier";
import { formatCurrency, formatNumber, formatShortDate } from "~/utils/format";
import ProductHeader from "./ProductHeader.vue";
import ProductRowActions from "./ProductRowActions.vue";
import ProductBulkDeleteModal from "../modals/ProductBulkDeleteModal.vue";
import { useModal } from "~/composables/admin/useModal";

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
  search: string;
  categoryId: string;
  stockStatus: string;
  status: string;
}>();

const table = useTemplateRef("table");
const productStore = useProductStore();
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
    map[supplier.id] = supplier.name;
  }
  return map;
});

const filteredProducts = computed(() => {
  const query = props.search.trim().toLowerCase();
  return props.products.filter((product) => {
    const categoryMatch =
      props.categoryId === "all" || product.category_id === props.categoryId;
    const statusMatch =
      props.status === "all" ||
      (props.status === "active" && product.is_active) ||
      (props.status === "inactive" && !product.is_active);
    const stockMatch =
      props.stockStatus === "all" ||
      (props.stockStatus === "low" &&
        product.stock_quantity <= product.minimum_stock_quantity &&
        product.stock_quantity > 0) ||
      (props.stockStatus === "out" && product.stock_quantity === 0) ||
      (props.stockStatus === "healthy" &&
        product.stock_quantity > product.minimum_stock_quantity);

    const supplierName = product.supplier_id
      ? (supplierMap.value[product.supplier_id] ?? "")
      : "";
    const searchMatch =
      !query ||
      product.name.toLowerCase().includes(query) ||
      product.sku.toLowerCase().includes(query) ||
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

const allSelected = computed(
  () =>
    selectableIds.value.length > 0 &&
    selectableIds.value.every((id) => selectedIds.value.has(id)),
);

const toggleAll = (value: boolean) => {
  const next = new Set(selectedIds.value);
  if (value) {
    selectableIds.value.forEach((id) => next.add(id));
  } else {
    selectableIds.value.forEach((id) => next.delete(id));
  }
  selectedIds.value = next;
};

const toggleOne = (id: string | undefined, value: boolean) => {
  if (!id) return;
  const next = new Set(selectedIds.value);
  if (value) {
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
  { id: "price", header: "Price", accessorFn: (row) => row.price },
  { id: "stock", header: "Stock", accessorFn: (row) => row.stock_quantity },
  { id: "status", header: "Status", accessorFn: (row) => row.is_active },
  { id: "updated", header: "Updated", accessorFn: (row) => row.updated_at },
  { id: "actions", header: "" },
];

const stockBadge = (product: Product): { color: BadgeColor; label: string } => {
  if (product.stock_quantity === 0) {
    return { color: "error", label: "Out of stock" };
  }
  if (product.stock_quantity <= product.minimum_stock_quantity) {
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
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[1][0]).toUpperCase();
};
</script>

<template>
  <UCard>
    <ProductHeader />
    <div v-if="selectedCount" class="mb-4 flex items-center justify-between">
      <p class="text-xs text-slate-500">
        Selected {{ selectedCount }} products
      </p>
      <UButton
        color="error"
        variant="outline"
        icon="i-lucide-trash-2"
        @click="handleBulkDelete"
      >
        Delete selected
      </UButton>
    </div>

    <UTable
      ref="table"
      v-model:pagination="pagination"
      :data="filteredProducts"
      :columns="columns"
      class="text-sm"
      :pagination-options="{
        getPaginationRowModel: getPaginationRowModel(),
      }"
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
        <span class="text-slate-600">
          {{
            row.original.category_id
              ? categoryMap[row.original.category_id]
              : "Unassigned"
          }}
        </span>
      </template>
      <template #price-cell="{ row }">
        <span class="font-medium">
          {{ formatCurrency(row.original.price) }}
        </span>
      </template>
      <template #stock-cell="{ row }">
        <div class="flex flex-col">
          <span class="font-medium">
            {{
              row.original.stock_quantity
                ? formatNumber(row.original.stock_quantity)
                : "_"
            }}
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
          {{
            row.original.updated_at
              ? formatShortDate(row.original.updated_at)
              : "_"
          }}
        </span>
      </template>
      <template #actions-cell="{ row }">
        <ProductRowActions :product="row.original" />
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

  <!-- <ProductQuickEditModal
    :open="editOpen"
    :product="selectedProduct"
    :categories="props.categories"
    :suppliers="props.suppliers"
    @update:open="editOpen = $event"
  /> -->
</template>
