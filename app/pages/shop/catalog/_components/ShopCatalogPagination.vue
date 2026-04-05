<script setup lang="ts">
const props = defineProps<{
  currentPage: number;
  totalPages: number;
  pages: number[];
}>();

const emit = defineEmits<{
  (e: "change", page: number): void;
}>();
</script>

<template>
  <StorefrontSectionCard padding="md">
    <div class="flex flex-wrap items-center justify-center gap-2">
      <StorefrontButton
        tone="ghost"
        size="sm"
        :disabled="props.currentPage <= 1"
        @click="emit('change', props.currentPage - 1)"
      >
        Previous
      </StorefrontButton>

      <button
        v-for="page in props.pages"
        :key="page"
        type="button"
        class="flex h-10 min-w-10 items-center justify-center rounded-xl border px-3 text-sm font-semibold transition"
        :class="
          page === props.currentPage
            ? 'border-slate-900 bg-slate-900 text-white'
            : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
        "
        @click="emit('change', page)"
      >
        {{ page }}
      </button>

      <StorefrontButton
        tone="ghost"
        size="sm"
        :disabled="props.currentPage >= props.totalPages"
        @click="emit('change', props.currentPage + 1)"
      >
        Next
      </StorefrontButton>
    </div>
  </StorefrontSectionCard>
</template>
