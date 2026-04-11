<script setup lang="ts">
import type { Category } from "~/types/category";
import StorefrontSkeletonGrid from "~/components/storefront/StorefrontSkeletonGrid.vue";
import StorefrontStateCard from "~/components/storefront/StorefrontStateCard.vue";
import ShopHomeCategoryCard from "./ShopHomeCategoryCard.vue";

const props = defineProps<{
  categories: Category[];
  isLoading?: boolean;
  activeCategoryId?: string;
}>();
</script>

<template>
  <section id="categories" class="py-12 md:py-16">
    <StorefrontPageContainer size="wide">
      <div class="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <StorefrontSectionHeading
          eyebrow="Material Categories"
          title="Browse by trade, material, and job-site need."
          description="Move quickly through cement, steel, tools, electrical, plumbing, paint, aggregates, safety materials, and the active categories in your catalog."
        />

        <div
          v-if="props.activeCategoryId"
          class="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-slate-500"
        >
          <UIcon name="i-lucide-filter" />
          Category filter active
        </div>
      </div>

      <StorefrontSkeletonGrid
        v-if="props.isLoading"
        :count="4"
        columns-class="grid gap-4 sm:grid-cols-2 lg:grid-cols-4"
        item-class="h-[260px]"
      />

      <StorefrontStateCard
        v-else-if="!props.categories.length"
        eyebrow="Categories"
        title="Categories will appear here once inventory is available."
        description="Published categories will help buyers browse by material type, use case, and supply path."
      />

      <div v-else class="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <ShopHomeCategoryCard
          v-for="category in props.categories"
          :key="category.id"
          :category="category"
          :is-active="category.id === props.activeCategoryId"
        />
      </div>
    </StorefrontPageContainer>
  </section>
</template>
