<script setup lang="ts">
import type { TableColumn } from "@nuxt/ui";
import type { Category } from "~/types/category";
import type { Product } from "~/types/product";
import { formatShortDate } from "~/utils/format";

const props = defineProps<{
  categories: Category[];
  products: Product[];
}>();

const emit = defineEmits<{
  (e: "edit", category: Category): void;
}>();

const productCounts = computed(() => {
  const counts: Record<string, number> = {};
  for (const product of props.products) {
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

    <UTable :data="props.categories" :columns="columns" class="text-sm">
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
          <UButton
            color="neutral"
            variant="ghost"
            size="sm"
            icon="i-lucide-pencil"
            @click="emit('edit', row.original)"
          >
            Edit
          </UButton>
        </div>
      </template>
    </UTable>
  </UCard>
</template>
