<script setup lang="ts">
const props = defineProps<{
  total: number;
  search: string;
  activeCategoryLabel: string;
}>();
</script>

<template>
  <section class="rounded-[32px] border border-slate-200/70 bg-white p-6 shadow-sm md:p-8">
    <div class="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
      <div class="max-w-3xl">
        <p class="text-xs uppercase tracking-[0.22em] text-amber-600">
          Buyer Storefront
        </p>
        <h1 class="mt-3 text-3xl font-semibold tracking-tight text-slate-900 md:text-4xl">
          Browse construction materials built for fast buying decisions.
        </h1>
        <p class="mt-3 text-sm leading-7 text-slate-600 md:text-base">
          Explore stocked products, compare pricing, and build a quick material
          shortlist before moving into cart and checkout.
        </p>
      </div>

      <div class="flex flex-wrap items-center gap-3">
        <UBadge color="warning" variant="subtle">
          {{ props.total }} products
        </UBadge>
        <UBadge color="neutral" variant="subtle">
          {{ props.activeCategoryLabel }}
        </UBadge>
        <UBadge v-if="props.search" color="info" variant="subtle">
          Search: {{ props.search }}
        </UBadge>
      </div>
    </div>
  </section>
</template>
