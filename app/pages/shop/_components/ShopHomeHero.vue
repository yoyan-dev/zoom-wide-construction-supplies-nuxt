<script setup lang="ts">
type HeroStat = {
  label: string;
  value: string;
};

const props = defineProps<{
  stats: HeroStat[];
  featuredProductName?: string;
  featuredProductImage?: string | null;
}>();

const heroImage = computed(
  () =>
    props.featuredProductImage ||
    "https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=1600&q=80",
);
</script>

<template>
  <section class="relative overflow-hidden border-b border-slate-200/80 bg-slate-950">
    <div class="absolute inset-0">
      <NuxtImg
        :src="heroImage"
        :alt="featuredProductName || 'Construction site overview'"
        class="h-full w-full object-cover"
      />
      <div class="absolute inset-0 bg-slate-950/68" />
      <div class="absolute inset-0 bg-[linear-gradient(90deg,rgba(3,20,37,0.92),rgba(3,20,37,0.68),rgba(3,20,37,0.34))]" />
    </div>

    <StorefrontPageContainer
      size="wide"
      class="relative py-14 md:py-18 lg:py-20"
    >
      <div class="max-w-3xl">
        <p
          class="inline-flex rounded-md border border-amber-200 bg-amber-50 px-3 py-1 text-[0.7rem] font-semibold uppercase tracking-[0.18em] text-amber-700"
        >
          Job-Site Supply Catalog
        </p>
        <h1
          class="mt-6 max-w-3xl text-4xl font-semibold leading-tight text-white sm:text-5xl lg:text-6xl"
        >
          Construction supplies organized for faster site purchasing.
        </h1>
        <p class="mt-5 max-w-2xl text-base leading-8 text-slate-200 sm:text-lg">
          ZOOM WIDE supports contractors, procurement teams, and repeat buyers
          with dependable materials, clear stock visibility, practical specs,
          and delivery-aware checkout from catalog to cart.
        </p>

        <div class="mt-8 flex flex-wrap gap-3">
          <StorefrontButton tone="primary" size="lg" to="/shop/catalog">
            Browse materials
          </StorefrontButton>
          <StorefrontButton tone="subtle" size="lg" to="/shop/standards">
            View standards
          </StorefrontButton>
        </div>

        <div class="mt-10 grid gap-3 sm:grid-cols-3">
          <div
            v-for="stat in props.stats"
            :key="stat.label"
            class="rounded-lg border border-white/15 bg-white/10 px-4 py-4 shadow-[0_12px_26px_rgba(3,20,37,0.14)] backdrop-blur-sm"
          >
            <p class="text-2xl font-semibold tracking-tight text-white">
              {{ stat.value }}
            </p>
            <p
              class="mt-1 text-[0.68rem] font-semibold uppercase tracking-[0.16em] text-slate-300"
            >
              {{ stat.label }}
            </p>
          </div>
        </div>
      </div>
    </StorefrontPageContainer>
  </section>
</template>
