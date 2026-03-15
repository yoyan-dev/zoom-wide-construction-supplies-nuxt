<script setup lang="ts">
import { getPaginationRowModel } from "@tanstack/vue-table";
import type { TableColumn } from "@nuxt/ui";
import type { Category } from "~/types/category";
import type { Product } from "~/types/product";
import { formatShortDate } from "~/utils/format";
import { useModal } from "~/composables/admin/useModal";
import CategoryEditModal from "./modals/CategoryEditModal.vue";
import CategoryDeleteModal from "./modals/CategoryDeleteModal.vue";
import CategoryViewModal from "./modals/CategoryViewModal.vue";

const table = useTemplateRef("table");
const props = defineProps<{
  categories: Category[];
  products: Product[];
}>();
const { openModal } = useModal();

const emit = defineEmits<{
  (e: "view", category: Category): void;
  (e: "edit", category: Category): void;
  (e: "delete", category: Category): void;
}>();

const productCounts = computed(() => {
  const counts: Record<string, number> = {};
  for (const product of props.products) {
    if (!product.category_id) continue;
    counts[product.category_id] = (counts[product.category_id] ?? 0) + 1;
  }
  return counts;
});

const columns: TableColumn<Category>[] = [
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
      <UButton color="neutral" variant="ghost" icon="i-lucide-filter">
        Filters
      </UButton>
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
          <div class="flex items-center gap-2">
            <UButton
              color="info"
              variant="outline"
              icon="i-lucide-eye"
              @click="openModal(CategoryViewModal, row.original)"
              >View</UButton
            >
            <UButton
              color="neutral"
              variant="outline"
              icon="i-lucide-pencil"
              @click="openModal(CategoryEditModal, row.original)"
              >Edit</UButton
            >
            <UButton
              color="error"
              variant="outline"
              icon="i-lucide-trash"
              @click="openModal(CategoryDeleteModal, row.original)"
              >Delete</UButton
            >
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
