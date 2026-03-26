<script setup lang="ts">
const props = defineProps<{
  categoryId: string;
  categoryOptions: Array<{ label: string; value: string }>;
  search: string;
}>();

const emit = defineEmits<{
  (e: "update:categoryId", value: string): void;
}>();
</script>

<template>
  <UCard>
    <div class="grid gap-4 md:grid-cols-[minmax(0,220px)_1fr]">
      <USelect
        :items="props.categoryOptions"
        :model-value="props.categoryId"
        placeholder="All categories"
        @update:model-value="emit('update:categoryId', String($event))"
      />
      <div class="rounded-2xl border border-slate-200/70 bg-slate-50/70 px-4 py-3 text-sm text-slate-600">
        <span v-if="props.search">
          Results are filtered by the storefront search for "{{ props.search }}".
        </span>
        <span v-else>
          Use the search bar in the header to narrow by product name, supplier, or category keywords.
        </span>
      </div>
    </div>
  </UCard>
</template>
