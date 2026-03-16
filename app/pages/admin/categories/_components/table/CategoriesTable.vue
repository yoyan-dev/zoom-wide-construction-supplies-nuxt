<script setup lang="ts">
import { getPaginationRowModel } from "@tanstack/vue-table";
import type { TableColumn } from "@nuxt/ui";
import { storeToRefs } from "pinia";
import type { Category } from "~/types/category";
import type { Product } from "~/types/product";
import { formatShortDate } from "~/utils/format";
import { useModal } from "~/composables/admin/useModal";
import CategoryBulkDeleteModal from "../modals/CategoryBulkDeleteModal.vue";
import CategoryRowActions from "./CategoryRowActions.vue";

const table = useTemplateRef("table");
const props = defineProps<{
  categories: Category[];
  products: Product[];
}>();
const { openModal } = useModal();
const categoryStore = useCategoryStore();
const { query } = storeToRefs(categoryStore);
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

const toggleOne = (id: string, value: boolean) => {
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
  openModal(CategoryBulkDeleteModal, {
    ids: Array.from(selectedIds.value),
    onDeleted: () => {
      selectedIds.value = new Set();
    },
  });
};

const handleSearch = async (value: string) => {
  await categoryStore.setSearch(value);
};

watch(selectableIds, (ids) => {
  const next = new Set<string>();
  for (const id of ids) {
    if (selectedIds.value.has(id)) next.add(id);
  }
  selectedIds.value = next;
});

const columns: TableColumn<Category>[] = [
  {
    id: "select",
    header: "",
  },
  {
    id: "name",
    header: "Category",
    accessorFn: (row) => row.name,
  },
  {
    id: "description",
    header: "Description",
    accessorFn: (row) => row.description ?? "No description",
  },
  {
    id: "products",
    header: "Products",
    accessorFn: (row) => productCounts.value[row.id] ?? 0,
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
    <div class="mb-4 flex items-center justify-between">
      <div>
        <p class="text-xs uppercase tracking-[0.18em] text-slate-500">
          Catalog Structure
        </p>
        <p class="mt-1 text-lg font-semibold">Category overview</p>
      </div>
      <div class="flex items-center gap-2">
        <UInput
          :model-value="query.q ?? ''"
          class="w-56"
          icon="i-lucide-search"
          placeholder="Search categories"
          @update:model-value="handleSearch(String($event))"
        />
        <UButton color="neutral" variant="ghost" icon="i-lucide-filter">
          Filters
        </UButton>
        <UButton
          v-if="selectedCount"
          color="error"
          variant="outline"
          icon="i-lucide-trash-2"
          @click="handleBulkDelete"
        >
          Delete selected ({{ selectedCount }})
        </UButton>
      </div>
    </div>

    <UTable
      ref="table"
      v-model:pagination="pagination"
      :data="props.categories"
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
            :model-value="selectedIds.has(row.original.id)"
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
      <template #description-cell="{ row }">
        <span class="text-slate-600">
          {{ row.original.description ?? "No description" }}
        </span>
      </template>
      <template #products-cell="{ row }">
        <UBadge color="info" variant="subtle">
          {{ productCounts[row.original.id] ?? 0 }} products
        </UBadge>
      </template>
      <template #updated-cell="{ row }">
        <span class="text-slate-600">
          {{ formatShortDate(row.original.updated_at) }}
        </span>
      </template>
      <template #actions-cell="{ row }">
        <div class="flex justify-end">
          <CategoryRowActions :category="row.original" />
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
