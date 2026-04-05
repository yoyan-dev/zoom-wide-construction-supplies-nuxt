<script setup lang="ts">
const props = defineProps<{
  currentPage: number;
  totalPages: number;
  pages: number[];
}>();

const emit = defineEmits<{
  (e: "change", page: number): void;
}>();

const hasPrev = computed(() => props.currentPage > 1);
const hasNext = computed(() => props.currentPage < props.totalPages);
</script>

<template>
  <div
    v-if="props.totalPages > 1"
    class="flex flex-wrap items-center justify-center gap-2"
  >
    <button
      type="button"
      class="flex h-10 min-w-10 items-center justify-center rounded-lg border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-700 transition hover:border-slate-300 disabled:cursor-not-allowed disabled:opacity-50"
      :disabled="!hasPrev"
      @click="emit('change', props.currentPage - 1)"
    >
      Prev
    </button>

    <button
      v-for="page in props.pages"
      :key="page"
      type="button"
      class="flex h-10 min-w-10 items-center justify-center rounded-lg border px-3 text-sm font-semibold transition"
      :class="
        page === props.currentPage
          ? 'border-slate-900 bg-slate-900 text-white'
          : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
      "
      @click="emit('change', page)"
    >
      {{ page }}
    </button>

    <button
      type="button"
      class="flex h-10 min-w-10 items-center justify-center rounded-lg border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-700 transition hover:border-slate-300 disabled:cursor-not-allowed disabled:opacity-50"
      :disabled="!hasNext"
      @click="emit('change', props.currentPage + 1)"
    >
      Next
    </button>
  </div>
</template>
