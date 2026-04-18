<script setup lang="ts">
import type { PaginationMeta } from "~/types/pagination";

const props = defineProps<{
  pagination: PaginationMeta;
}>();

const emit = defineEmits<{
  (event: "page-change", page: number): void;
}>();

const page = computed(() => props.pagination.page ?? 1);
const limit = computed(() => props.pagination.limit ?? 10);
const total = computed(() => props.pagination.total ?? 0);
const shouldShow = computed(() => total.value > limit.value);
</script>

<template>
  <div
    v-if="shouldShow"
    class="flex justify-end border-t border-default px-4 pt-4"
  >
    <UPagination
      :page="page"
      :items-per-page="limit"
      :total="total"
      @update:page="emit('page-change', $event)"
    />
  </div>
</template>
