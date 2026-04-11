<script setup lang="ts">
import type { Category } from "~/types/category";

const props = defineProps<{
  category: Category;
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

const supportLines = computed(() => {
  const buyingNotes = props.category.buying_considerations?.slice(0, 2) ?? [];

  if (buyingNotes.length) {
    return buyingNotes;
  }

  return [
    "Stock visibility",
    "Specification-ready items",
  ];
});

const fallbackImage = `https://placehold.co/1200x900/e2e8f0/0f172a?text=${encodeURIComponent(
  props.category.name,
)}`;
</script>

<template>
  <NuxtLink
    :to="cardTarget"
    class="group flex h-full min-h-[260px] flex-col overflow-hidden rounded-lg border border-slate-200/90 bg-white shadow-[0_14px_30px_rgba(15,23,42,0.04)] transition hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-[0_18px_34px_rgba(15,23,42,0.06)]"
    :class="[
      props.isActive &&
        'ring-2 ring-amber-300 ring-offset-4 ring-offset-slate-50',
    ]"
  >
    <div class="aspect-[4/3] overflow-hidden bg-slate-100">
      <NuxtImg
        :src="props.category.image_url || fallbackImage"
        :alt="props.category.name"
        class="h-full w-full object-cover transition duration-500 group-hover:scale-[1.03]"
        loading="lazy"
      />
    </div>

    <div class="flex flex-1 flex-col gap-4 p-5">
      <div class="flex items-start justify-between gap-4">
        <div>
          <p
            class="text-[0.68rem] font-semibold uppercase tracking-[0.16em] text-amber-700"
          >
            Supply category
          </p>
          <h3 class="mt-2 text-xl font-semibold text-slate-950">
            {{ props.category.name }}
          </h3>
        </div>
        <span
          class="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-slate-200 bg-slate-50 text-slate-700"
        >
          <UIcon name="i-lucide-arrow-up-right" class="text-lg" />
        </span>
      </div>

      <p class="line-clamp-3 text-sm leading-7 text-slate-600">
        {{ props.category.overview || props.category.description }}
      </p>

      <div class="mt-auto flex flex-wrap gap-2">
        <span
          v-for="line in detailLines"
          :key="line"
          class="rounded-md border border-slate-200 bg-slate-50 px-3 py-1 text-[0.68rem] font-medium text-slate-600"
        >
          {{ line }}
        </span>
      </div>

      <div class="mt-1 grid gap-2 border-t border-slate-200 pt-4">
        <div
          v-for="line in supportLines"
          :key="`support-${line}`"
          class="flex items-center gap-2 text-xs font-semibold text-slate-600"
        >
          <UIcon name="i-lucide-check" class="text-amber-700" />
          <span>{{ line }}</span>
        </div>
      </div>
    </div>
  </NuxtLink>
</template>
