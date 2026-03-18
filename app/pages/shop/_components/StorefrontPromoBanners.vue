<script setup lang="ts">
import type { StorefrontPromoBanner } from "./storefront.data";

const props = defineProps<{
  banners: StorefrontPromoBanner[];
}>();
</script>

<template>
  <section class="grid gap-4 xl:grid-cols-3">
    <NuxtLink
      v-for="banner in props.banners"
      :key="banner.id"
      :to="banner.to"
      class="rounded-[32px] border border-amber-200/60 bg-gradient-to-br from-amber-50 via-white to-stone-100 p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
    >
      <div class="flex items-center justify-between gap-4">
        <p class="text-xs uppercase tracking-[0.18em] text-amber-700">
          {{ banner.eyebrow }}
        </p>
        <UBadge color="warning" variant="subtle">
          {{ banner.badge }}
        </UBadge>
      </div>

      <h3 class="mt-4 text-2xl font-semibold leading-tight text-slate-900">
        {{ banner.title }}
      </h3>
      <p class="mt-3 text-sm leading-6 text-slate-600">
        {{ banner.description }}
      </p>

      <div class="mt-6">
        <UButton color="neutral" variant="outline" trailing-icon="i-lucide-arrow-right">
          {{ banner.ctaLabel }}
        </UButton>
      </div>
    </NuxtLink>
  </section>
</template>
