<script setup lang="ts">
const props = defineProps<{
  cards: Array<{
    title: string;
    value: string;
    description: string;
    icon: string;
  }>;
}>();
</script>

<template>
  <section class="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
    <article
      v-for="card in props.cards"
      :key="card.title"
      class="rounded-sm bg-white p-5 shadow-sm dark:bg-gray-900"
    >
      <div class="flex items-start justify-between gap-3">
        <div>
          <p class="text-xs uppercase tracking-[0.16em] text-slate-500">
            {{ card.title }}
          </p>
          <p class="mt-2 text-2xl font-semibold tracking-tight text-slate-900">
            {{ card.value }}
          </p>
          <p class="mt-2 text-sm text-slate-600">
            {{ card.description }}
          </p>
        </div>
        <div class="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-900 text-white">
          <UIcon :name="card.icon" />
        </div>
      </div>
    </article>
  </section>
</template>
