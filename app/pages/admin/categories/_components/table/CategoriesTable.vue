<script setup lang="ts">
import type { TableColumn } from "@nuxt/ui";
import type { Category } from "~/types/category";
import type { PaginationMeta } from "~/types/pagination";
import type { Product } from "~/types/product";
import { formatShortDateOrFallback } from "~/utils/format";
import { useModal } from "~/composables/admin/useModal";
import AdminTableEmptyState from "../../../_components/AdminTableEmptyState.vue";
import AdminServerPagination from "../../../_components/AdminServerPagination.vue";
import AdminTableSelectionBar from "../../../_components/AdminTableSelectionBar.vue";
import CategoryBulkDeleteModal from "../modals/CategoryBulkDeleteModal.vue";
import CategoryRowActions from "./CategoryRowActions.vue";

const props = defineProps<{
  categories: Category[];
  products: Product[];
  isLoading: boolean;
  pagination: PaginationMeta;
}>();
const emit = defineEmits<{
  (event: "page-change", page: number): void;
}>();
const { openModal } = useModal();
const selectedIds = ref<Set<string>>(new Set());

const productCounts = computed(() => {
  const counts: Record<string, number> = {};
  for (const product of props.products) {
    if (!product.category_id) continue;
    counts[product.category_id] = (counts[product.category_id] ?? 0) + 1;
  }
  return counts;
});

const selectableIds = computed(() =>
  props.categories.map((category) => category.id),
);
const selectedCount = computed(() => selectedIds.value.size);
const hasRows = computed(() => props.categories.length > 0);

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

const toggleOne = (id: string, value: boolean | "indeterminate") => {
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
  openModal(CategoryBulkDeleteModal, {
    ids: Array.from(selectedIds.value),
    onDeleted: () => {
      selectedIds.value = new Set();
    },
  });
};

const specCount = (category: Category) => category.featured_specs?.length ?? 0;
const usesCount = (category: Category) => category.typical_uses?.length ?? 0;

watch(selectableIds, (ids) => {
  const next = new Set<string>();
  for (const id of ids) {
    if (selectedIds.value.has(id)) next.add(id);
  }
  selectedIds.value = next;
});

const columns: TableColumn<Category>[] = [
  { id: "select", header: "" },
  { id: "name", header: "Category", accessorFn: (row) => row.name },
  {
    id: "signals",
    header: "Signals",
    accessorFn: (row) => specCount(row) + usesCount(row),
  },
  {
    id: "products",
    header: "Products",
    accessorFn: (row) => productCounts.value[row.id] ?? 0,
  },
  { id: "updated", header: "Updated", accessorFn: (row) => row.updated_at },
  { id: "actions", header: "" },
];

</script>

<template>
  <UCard class="bg-white dark:bg-gray-900 rounded-sm">
    <AdminTableSelectionBar
      v-if="selectedCount"
      :count="selectedCount"
      item-label="categories"
      @action="handleBulkDelete"
    />

    <UTable
      v-if="props.isLoading || hasRows"
      :data="props.categories"
      :columns="columns"
      class="text-sm"
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
            :model-value="selectedIds.has(row.original.id)"
            @update:model-value="toggleOne(row.original.id, $event)"
          />
        </div>
      </template>
      <template #name-cell="{ row }">
        <div class="flex items-center gap-3">
          <div class="flex flex-col">
            <span class="font-medium">{{ row.original.name }}</span>
            <span class="text-xs text-slate-500">
              {{
                row.original.overview
                  ? "Category overview available"
                  : "Category details available"
              }}
            </span>
          </div>
        </div>
      </template>
      <template #signals-cell="{ row }">
        <div class="flex flex-wrap gap-2">
          <UBadge color="info" variant="subtle">
            {{ row.original.typical_uses?.length ?? 0 }} uses
          </UBadge>
          <UBadge color="warning" variant="subtle">
            {{ row.original.buying_considerations?.length ?? 0 }} notes
          </UBadge>
          <UBadge color="neutral" variant="subtle">
            {{ row.original.featured_specs?.length ?? 0 }} specs
          </UBadge>
        </div>
      </template>
      <template #products-cell="{ row }">
        <UBadge color="success" variant="subtle">
          {{ productCounts[row.original.id] ?? 0 }} products
        </UBadge>
      </template>
      <template #updated-cell="{ row }">
        <span class="text-slate-600">
          {{ formatShortDateOrFallback(row.original.updated_at) }}
        </span>
      </template>
      <template #actions-cell="{ row }">
        <div class="flex justify-end">
          <CategoryRowActions :category="row.original" />
        </div>
      </template>
    </UTable>
    <AdminTableEmptyState
      v-else
      title="No categories yet"
      description="Create a category to start organizing the product catalog."
    />
    <AdminServerPagination
      v-if="hasRows"
      :pagination="props.pagination"
      @page-change="emit('page-change', $event)"
    />
  </UCard>
</template>
