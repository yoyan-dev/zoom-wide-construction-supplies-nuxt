<script setup lang="ts">
import type { Category } from "~/types/category";

const props = defineProps<{
  category: Category;
  isLarge?: boolean;
  isActive?: boolean;
}>();

const cardTarget = computed(() => ({
  path: "/shop/catalog",
  query: {
    category_id: props.category.id,
  },
}));

const detailLines = computed(() => {
  const details = props.category.featured_specs?.slice(0, 2) ?? [];

  if (details.length) {
    return details.map((item) => `${item.label}: ${item.value}`);
  }

  return (props.category.typical_uses ?? []).slice(0, 2);
});

const fallbackImage = `https://placehold.co/1200x900/e2e8f0/0f172a?text=${encodeURIComponent(
  props.category.name,
)}`;
</script>

<template>
  <NuxtLink
    :to="cardTarget"
    class="group relative flex min-h-[260px] overflow-hidden rounded-xl border border-slate-200/70"
    :class="[
      props.isLarge ? 'md:min-h-[340px]' : 'md:min-h-[280px]',
      props.isActive &&
        'ring-2 ring-amber-400 ring-offset-4 ring-offset-slate-50',
    ]"
  >
    <NuxtImg
      :src="props.category.image_url || fallbackImage"
      :alt="props.category.name"
      class="absolute inset-0 h-full w-full object-cover transition duration-700 group-hover:scale-105"
      loading="lazy"
    />
    <div
      class="absolute inset-0 bg-[linear-gradient(180deg,rgba(2,22,52,0.16)_0%,rgba(2,22,52,0.9)_88%)]"
    />

    <div class="relative mt-auto flex w-full flex-col gap-4 p-6 md:p-8">
      <div class="flex items-start justify-between gap-4">
        <div>
          <p
            class="text-[0.68rem] font-semibold uppercase tracking-[0.22em] text-amber-200"
          >
            Core category
          </p>
          <h3 class="mt-2 text-2xl font-bold text-white md:text-3xl">
            {{ props.category.name }}
          </h3>
        </div>
        <span
          class="flex h-10 w-10 items-center justify-center rounded-lg bg-white/12 text-white backdrop-blur-sm"
        >
          <UIcon name="i-lucide-arrow-up-right" class="text-lg" />
        </span>
      </div>

      <p class="max-w-lg text-sm leading-7 text-slate-200">
        {{ props.category.overview || props.category.description }}
      </p>

      <div class="flex flex-wrap gap-2">
        <span
          v-for="line in detailLines"
          :key="line"
          class="rounded-md border border-white/12 bg-white/10 px-3 py-1 text-[0.68rem] font-medium uppercase tracking-[0.18em] text-slate-100"
        >
          {{ line }}
        </span>
      </div>
    </div>
  </NuxtLink>
</template>
