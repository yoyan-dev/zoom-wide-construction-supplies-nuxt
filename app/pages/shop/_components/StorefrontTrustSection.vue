<script setup lang="ts">
import type { StorefrontTrustPoint } from "./storefront.data";
import StorefrontSectionHeader from "./StorefrontSectionHeader.vue";

const props = defineProps<{
  points: StorefrontTrustPoint[];
}>();
</script>

<template>
  <section class="rounded-[32px] border border-slate-200/70 bg-white p-6 shadow-sm sm:p-8">
    <StorefrontSectionHeader
      eyebrow="Why Buyers Choose Us"
      title="Built for practical procurement, not endless browsing"
      description="The storefront keeps trust signals close to the products so buyers can move faster with clearer expectations."
    />

    <div class="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      <div
        v-for="point in props.points"
        :key="point.id"
        class="rounded-[24px] border border-slate-200/70 bg-slate-50/80 p-5"
      >
        <div class="flex h-11 w-11 items-center justify-center rounded-2xl bg-amber-100 text-amber-700">
          <UIcon :name="point.icon" class="text-xl" />
        </div>
        <h3 class="mt-4 text-lg font-semibold text-slate-900">
          {{ point.title }}
        </h3>
        <p class="mt-2 text-sm leading-6 text-slate-600">
          {{ point.description }}
        </p>
      </div>
    </div>
  </section>
</template>
