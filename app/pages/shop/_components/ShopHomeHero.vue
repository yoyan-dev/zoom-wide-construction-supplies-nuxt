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
  <section class="relative overflow-hidden border-b border-slate-200/70">
    <div class="absolute inset-0">
      <NuxtImg
        :src="heroImage"
        :alt="featuredProductName || 'Construction site overview'"
        class="h-full w-full object-cover"
      />
      <div
        class="absolute inset-0 bg-[linear-gradient(110deg,rgba(2,22,52,0.96)_0%,rgba(4,70,135,0.88)_48%,rgba(4,70,135,0.18)_100%)]"
      />
      <div
        class="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(254,117,11,0.28),transparent_22%)]"
      />
    </div>

    <StorefrontPageContainer
      size="wide"
      class="relative py-18 md:py-24 lg:py-30"
    >
      <div
        class="grid gap-10 lg:grid-cols-[minmax(0,1.15fr)_minmax(280px,0.85fr)] lg:items-end"
      >
        <div class="max-w-3xl">
          <p
            class="inline-flex rounded-md border border-amber-300/35 bg-amber-400/14 px-3 py-1 text-[0.7rem] font-semibold uppercase tracking-[0.24em] text-amber-100"
          >
            Industrial Grade Excellence
          </p>
          <h1
            class="mt-6 text-5xl font-bold tracking-[-0.06em] text-white sm:text-6xl lg:text-8xl"
          >
            Precision in every
            <span class="block text-amber-300">beam, board, and bolt.</span>
          </h1>
          <p
            class="mt-6 max-w-2xl text-base leading-8 text-slate-200 sm:text-lg"
          >
            ZOOM WIDE supports contractors, procurement teams, and repeat buyers
            with dependable materials, clear stock visibility, and a cleaner
            buying path for every build stage.
          </p>

          <div class="mt-10 flex flex-wrap gap-3">
            <StorefrontButton tone="primary" size="xl" to="/shop/catalog">
              Browse Materials
            </StorefrontButton>
            <StorefrontButton tone="secondary" size="xl" to="/shop/standards">
              View Standards
            </StorefrontButton>
          </div>

          <div class="mt-12 grid gap-3 sm:grid-cols-3">
            <div
              v-for="stat in props.stats"
              :key="stat.label"
              class="rounded-xl border border-white/12 bg-white/8 px-4 py-4 backdrop-blur-sm"
            >
              <p class="text-2xl font-bold tracking-tight text-white">
                {{ stat.value }}
              </p>
              <p
                class="mt-1 text-[0.7rem] font-semibold uppercase tracking-[0.2em] text-slate-300"
              >
                {{ stat.label }}
              </p>
            </div>
          </div>
        </div>

        <StorefrontSectionCard
          as="aside"
          class="overflow-hidden border-white/12 bg-white/10 text-white backdrop-blur-sm"
          padding="none"
        >
          <div class="grid gap-0 md:grid-cols-[1.1fr_0.9fr] lg:grid-cols-1">
            <div
              class="border-b border-white/12 p-6 lg:border-b-0 lg:border-r lg:border-white/12"
            >
              <p
                class="text-[0.72rem] font-semibold uppercase tracking-[0.22em] text-amber-200"
              >
                Featured supply
              </p>
              <h2 class="mt-3 text-3xl font-bold tracking-tight">
                {{ props.featuredProductName || "Specification-ready catalog" }}
              </h2>
              <p class="mt-4 text-sm leading-7 text-slate-200">
                A focused storefront for supply teams that need strong category
                discovery, fast shortlist building, and fewer dead ends.
              </p>
            </div>

            <div class="relative min-h-[280px] lg:min-h-[340px]">
              <NuxtImg
                :src="heroImage"
                :alt="
                  props.featuredProductName || 'Featured construction material'
                "
                class="absolute inset-0 h-full w-full object-cover"
              />
              <div
                class="absolute inset-0 bg-[linear-gradient(180deg,rgba(2,22,52,0)_0%,rgba(2,22,52,0.72)_100%)]"
              />
            </div>
          </div>
        </StorefrontSectionCard>
      </div>
    </StorefrontPageContainer>
  </section>
</template>
