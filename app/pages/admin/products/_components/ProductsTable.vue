<script setup lang="ts">
import type { TableColumn } from "@nuxt/ui";
import type { Category } from "~/types/category";
import type { Product } from "~/types/product";
import type { Supplier } from "~/types/supplier";
import { formatCurrency, formatNumber, formatShortDate } from "~/utils/format";
import ProductQuickEditModal from "./ProductQuickEditModal.vue";
import ProductHeader from "./ProductHeader.vue";

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

const selectedProduct = ref<Product | null>(null);
const editOpen = ref(false);

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

const columns: TableColumn<Product>[] = [
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

const openEdit = (product: Product) => {
  selectedProduct.value = product;
  editOpen.value = true;
};
</script>

<template>
  <UCard>
    <ProductHeader />

    <UTable :data="filteredProducts" :columns="columns" class="text-sm">
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
          {{ categoryMap[row.original.category_id] ?? "Unassigned" }}
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
            {{ formatNumber(row.original.stock_quantity) }}
            {{ row.original.unit }}
          </span>
          <span class="text-xs text-slate-500">
            Min {{ formatNumber(row.original.minimum_stock_quantity) }}
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
          {{ formatShortDate(row.original.updated_at) }}
        </span>
      </template>
      <template #actions-cell="{ row }">
        <div class="flex justify-end">
          <UButton
            color="neutral"
            variant="ghost"
            size="sm"
            icon="i-lucide-pencil"
            @click="openEdit(row.original)"
          >
            Quick Edit
          </UButton>
          <UButton
            color="primary"
            variant="ghost"
            size="sm"
            icon="i-lucide-arrow-up-right"
            :to="`/admin/products/edit/${row.original.id}`"
          >
            Edit Page
          </UButton>
        </div>
      </template>
    </UTable>
  </UCard>

  <ProductQuickEditModal
    :open="editOpen"
    :product="selectedProduct"
    :categories="props.categories"
    :suppliers="props.suppliers"
    @update:open="editOpen = $event"
  />
</template>
