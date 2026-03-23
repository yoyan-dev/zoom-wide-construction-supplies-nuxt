<script setup lang="ts">
import type { Category } from "~/types/category";
import StorefrontSectionHeader from "./StorefrontSectionHeader.vue";

type CategoryItem = {
  category: Category;
  productCount: number;
};

const props = defineProps<{
  items: CategoryItem[];
}>();
</script>

<template>
  <section>
    <StorefrontSectionHeader
      eyebrow="Category Shortcuts"
      title="Jump into the material lanes buyers use most"
      description="Browse practical supply groups early so the homepage feels like a working marketplace, not a brochure."
      link-label="See all categories"
      link-to="/shop/categories"
    />

    <div class="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <NuxtLink
        v-for="item in props.items"
        :key="item.category.id"
        :to="`/shop/categories/${item.category.id}`"
        class="group overflow-hidden rounded-[28px] border border-slate-200/70 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-md"
      >
        <div class="relative h-40 overflow-hidden">
          <div
            class="flex h-full w-full items-center justify-center bg-gradient-to-br from-amber-100 via-white to-slate-100 text-4xl font-semibold text-slate-700 transition duration-300 group-hover:scale-[1.03]"
          >
            {{ item.category.name?.slice(0, 1) ?? "C" }}
          </div>
          <UBadge
            color="warning"
            variant="solid"
            class="absolute left-4 top-4"
          >
            {{ item.productCount }} items
          </UBadge>
        </div>

        <div class="p-5">
          <h3 class="text-lg font-semibold text-slate-900">
            {{ item.category.name }}
          </h3>
          <p class="mt-2 line-clamp-3 text-sm leading-6 text-slate-600">
            {{ item.category.overview ?? item.category.description }}
          </p>
          <div class="mt-4 flex flex-wrap gap-2">
            <UBadge
              v-for="use in (item.category.typical_uses ?? []).slice(0, 2)"
              :key="use"
              color="neutral"
              variant="subtle"
            >
              {{ use }}
            </UBadge>
          </div>
        </div>
      </NuxtLink>
    </div>
  </section>
</template>
