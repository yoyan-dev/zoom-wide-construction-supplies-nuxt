<script setup lang="ts">
import { getPaginationRowModel } from "@tanstack/vue-table";
import type { TableColumn } from "@nuxt/ui";
import type { InventoryLog, InventoryMovementType } from "~/types/inventory";
import type { Product } from "~/types/product";
import { formatNumber, formatShortDate } from "~/utils/format";
import InventoryViewModal from "../modals/InventoryViewModal.vue";
import InventoryEditModal from "../modals/InventoryEditModal.vue";
import InventoryDeleteModal from "../modals/InventoryDeleteModal.vue";
import { useModal } from "~/composables/admin/useModal";

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
}>();
const { openModal } = useModal();

const productMap = computed(() => {
  const map: Record<string, Product> = {};
  for (const product of props.products) {
    if (!product.id) continue;
    map[product.id] = product;
  }
  return map;
});

const movementTone: Record<InventoryMovementType, BadgeColor> = {
  in: "success",
  out: "warning",
  adjustment: "info",
};

const columns: TableColumn<InventoryLog>[] = [
  {
    id: "entry",
    header: "Entry",
    accessorFn: (row) => row.id,
  },
  {
    id: "product",
    header: "Product",
    accessorFn: (row) => row.product_id,
  },
  {
    id: "movement",
    header: "Movement",
    accessorFn: (row) => row.movement_type,
  },
  {
    id: "quantity",
    header: "Quantity",
    accessorFn: (row) => row.quantity_change,
  },
  {
    id: "reference",
    header: "Reference",
    accessorFn: (row) => row.reference_id ?? "",
  },
  {
    id: "created",
    header: "Date",
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
          Inventory Ledger
        </p>
        <p class="mt-1 text-lg font-semibold">Inventory overview</p>
      </div>
      <UButton color="neutral" variant="ghost" icon="i-lucide-filter">
        Filters
      </UButton>
    </div>

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
      <template #entry-cell="{ row }">
        <div class="flex flex-col">
          <span class="font-medium">{{ row.original.id }}</span>
          <span class="text-xs text-slate-500">
            {{ row.original.reference_type ?? "Manual entry" }}
          </span>
        </div>
      </template>
      <template #product-cell="{ row }">
        <div class="flex flex-col">
          <span class="font-medium">
            {{
              productMap[row.original.product_id]?.name ??
              row.original.product_id
            }}
          </span>
          <span class="text-xs text-slate-500">
            {{ productMap[row.original.product_id]?.sku ?? "No SKU" }}
          </span>
        </div>
      </template>
      <template #movement-cell="{ row }">
        <UBadge
          :color="movementTone[row.original.movement_type]"
          variant="subtle"
        >
          {{ row.original.movement_type }}
        </UBadge>
      </template>
      <template #quantity-cell="{ row }">
        <span class="font-medium">
          {{ formatNumber(row.original.quantity_change) }}
        </span>
      </template>
      <template #reference-cell="{ row }">
        <span class="text-slate-600">
          {{ row.original.reference_id ?? "No reference" }}
        </span>
      </template>
      <template #created-cell="{ row }">
        <span class="text-slate-600">
          {{ formatShortDate(row.original.created_at) }}
        </span>
      </template>
      <template #actions-cell="{ row }">
        <div class="flex justify-end">
          <div class="flex items-center gap-2">
            <UButton
              color="info"
              variant="outline"
              size="sm"
              icon="i-lucide-eye"
              @click="openModal(InventoryViewModal, row.original)"
            >
              View
            </UButton>
            <UButton
              color="neutral"
              variant="outline"
              size="sm"
              icon="i-lucide-pencil"
              @click="openModal(InventoryEditModal, row.original)"
            >
              Edit
            </UButton>
            <UButton
              color="error"
              variant="outline"
              size="sm"
              icon="i-lucide-trash"
              @click="openModal(InventoryDeleteModal, row.original)"
            >
              Delete
            </UButton>
          </div>
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
