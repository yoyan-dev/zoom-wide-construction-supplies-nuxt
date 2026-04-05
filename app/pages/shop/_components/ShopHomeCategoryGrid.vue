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

const getCardClass = (index: number) =>
  index === 0 || index === 3
    ? "md:col-span-2 md:min-h-[340px]"
    : "md:min-h-[280px]";
</script>

<template>
  <section id="categories" class="py-14 md:py-18">
    <StorefrontPageContainer size="wide">
      <div class="mb-8 flex flex-col gap-4 md:mb-10 md:flex-row md:items-end md:justify-between">
        <StorefrontSectionHeading
          eyebrow="Structural Essentials"
          title="Featured categories built around real procurement needs."
          description="Zoom Wide organizes core supply types into cleaner category paths so buyers can move from discovery to shortlist faster."
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
        columns-class="grid gap-4 md:grid-cols-4"
        item-class="h-[280px]"
      />

      <StorefrontStateCard
        v-else-if="!props.categories.length"
        eyebrow="Categories"
        title="Categories will appear here once inventory is available."
        description="As product categories are published, this section can scale into a richer procurement entry point."
      />

      <div v-else class="grid gap-4 md:grid-cols-4">
        <ShopHomeCategoryCard
          v-for="(category, index) in props.categories"
          :key="category.id"
          :category="category"
          :is-large="index === 0 || index === 3"
          :is-active="category.id === props.activeCategoryId"
          :class="getCardClass(index)"
        />
      </div>
    </StorefrontPageContainer>
  </section>
</template>
