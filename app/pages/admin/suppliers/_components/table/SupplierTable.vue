<script setup lang="ts">
import { getPaginationRowModel } from "@tanstack/vue-table";
import type { TableColumn } from "@nuxt/ui";
import type { Product } from "~/types/product";
import type { Supplier } from "~/types/supplier";
import { formatShortDateOrFallback } from "~/utils/format";
import SupplierBulkDeleteModal from "../modals/SupplierBulkDeleteModal.vue";
import { useModal } from "~/composables/admin/useModal";
import AdminTableEmptyState from "../../../_components/AdminTableEmptyState.vue";
import AdminTableSelectionBar from "../../../_components/AdminTableSelectionBar.vue";
import SupplierRowActions from "./SupplierRowActions.vue";

const table = useTemplateRef("table");
const props = defineProps<{
  suppliers: Supplier[];
  products: Product[];
  isLoading: boolean;
}>();

const { openModal } = useModal();

const selectedIds = ref<Set<string>>(new Set());

const productCounts = computed(() => {
  const counts: Record<string, number> = {};
  for (const product of props.products) {
    if (!product.supplier_id) continue;
    counts[product.supplier_id] = (counts[product.supplier_id] ?? 0) + 1;
  }
  return counts;
});

const selectableIds = computed(() =>
  props.suppliers
    .map((supplier) => supplier.id)
    .filter((id): id is string => Boolean(id)),
);

const selectedCount = computed(() => selectedIds.value.size);
const hasRows = computed(() => props.suppliers.length > 0);

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
  openModal(SupplierBulkDeleteModal, {
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

const columns: TableColumn<Supplier>[] = [
  {
    id: "select",
    header: "",
  },
  {
    id: "name",
    header: "Supplier",
    accessorFn: (row) => row.name,
  },
  {
    id: "contact",
    header: "Contact",
    accessorFn: (row) => row.contact_name ?? "No contact",
  },
  {
    id: "products",
    header: "Products",
    accessorFn: (row) => (row.id ? productCounts.value[row.id] : 0),
  },
  {
    id: "updated",
    header: "Updated",
    accessorFn: (row) => row.updated_at,
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
    <AdminTableSelectionBar
      v-if="selectedCount"
      :count="selectedCount"
      item-label="suppliers"
      @action="handleBulkDelete"
    />

    <UTable
      v-if="props.isLoading || hasRows"
      ref="table"
      v-model:pagination="pagination"
      :data="props.suppliers"
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
      <template #name-cell="{ row }">
        <div class="flex flex-col">
          <span class="font-medium">{{ row.original.name }}</span>
          <span class="text-xs text-slate-500">{{ row.original.id }}</span>
        </div>
      </template>
      <template #contact-cell="{ row }">
        <div class="flex flex-col">
          <span class="text-slate-600">
            {{ row.original.contact_name ?? "No contact" }}
          </span>
          <span class="text-xs text-slate-500">
            {{ row.original.email ?? row.original.phone ?? "No contact info" }}
          </span>
        </div>
      </template>
      <template #products-cell="{ row }">
        <UBadge color="info" variant="subtle">
          {{ row.original.id ? productCounts[row.original.id] : 0 }} products
        </UBadge>
      </template>
      <template #updated-cell="{ row }">
        <span class="text-slate-600">
          {{ formatShortDateOrFallback(row.original.updated_at) }}
        </span>
      </template>
      <template #actions-cell="{ row }">
        <div class="flex justify-end">
          <SupplierRowActions :supplier="row.original" />
        </div>
      </template>
    </UTable>

    <AdminTableEmptyState
      v-else
      title="No suppliers yet"
      description="Add a supplier to track contacts and connect products to purchasing sources."
    />

    <div
      v-if="hasRows"
      class="flex justify-end border-t border-default px-4 pt-4"
    >
      <UPagination
        :page="(table?.tableApi?.getState().pagination.pageIndex || 0) + 1"
        :items-per-page="table?.tableApi?.getState().pagination.pageSize"
        :total="table?.tableApi?.getFilteredRowModel().rows.length"
        @update:page="(p) => table?.tableApi?.setPageIndex(p - 1)"
      />
    </div>
  </UCard>
</template>
