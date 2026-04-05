<script setup lang="ts">
const props = defineProps<{
  productCount: number;
  categoryCount: number;
}>();

const highlights = [
  {
    icon: "i-lucide-badge-check",
    title: "Specification-ready inventory",
    description:
      "Product handbook fields, category highlights, and stock visibility all support a more technical buying workflow.",
  },
  {
    icon: "i-lucide-truck",
    title: "Delivery-first supply flow",
    description:
      "The existing order and delivery architecture stays intact while the storefront gets a clearer procurement surface.",
  },
  {
    icon: "i-lucide-ruler",
    title: "Built for scale",
    description:
      "The new sections are modular and future-safe, so catalog, detail, and cart pages can extend the same visual language.",
  },
] as const;
</script>

<template>
  <section id="trust" class="py-14 md:py-18">
    <StorefrontPageContainer size="wide">
      <StorefrontSectionCard
        class="overflow-hidden bg-slate-950 text-white"
        padding="none"
      >
        <div class="grid gap-0 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)]">
          <div class="relative overflow-hidden p-6 md:p-8 lg:p-10">
            <div
              class="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(254,117,11,0.18),transparent_28%),linear-gradient(135deg,#031425_0%,#05203d_100%)]"
            />
            <div
              class="absolute inset-0 opacity-20"
              style="background-image: radial-gradient(#ffffff 1px, transparent 1px); background-size: 32px 32px;"
            />

            <div class="relative">
              <p class="text-[0.72rem] font-semibold uppercase tracking-[0.24em] text-amber-300">
                Built for engineering precision
              </p>
              <h2 class="mt-4 text-4xl font-bold tracking-[-0.05em] text-white md:text-5xl">
                Stronger trust signals for serious buyers.
              </h2>
              <p class="mt-5 max-w-2xl text-sm leading-8 text-slate-300 md:text-base">
                This home page keeps the storefront modern and restrained while
                still speaking to construction buyers who care about reliability,
                stock confidence, and clean procurement decisions.
              </p>

              <div class="mt-10 grid gap-5">
                <div
                  v-for="highlight in highlights"
                  :key="highlight.title"
                  class="flex gap-4 rounded-xl border border-white/8 bg-white/6 p-4"
                >
                  <div
                    class="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-amber-400/15 text-amber-300"
                  >
                    <UIcon :name="highlight.icon" class="text-lg" />
                  </div>
                  <div>
                    <h3 class="text-lg font-bold text-white">
                      {{ highlight.title }}
                    </h3>
                    <p class="mt-2 text-sm leading-7 text-slate-300">
                      {{ highlight.description }}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div class="border-t border-white/8 bg-white/6 p-6 md:p-8 lg:border-l lg:border-t-0 lg:p-10">
            <div class="overflow-hidden rounded-xl border border-white/10">
              <img
                src="https://images.unsplash.com/photo-1503387762-592deb58ef4e?auto=format&fit=crop&w=1200&q=80"
                alt="Architectural blueprint and construction planning materials"
                class="h-[260px] w-full object-cover"
                loading="lazy"
              />
            </div>

            <div class="mt-6 grid gap-4 sm:grid-cols-2">
              <div class="rounded-xl border border-white/8 bg-slate-900/60 p-5">
                <p class="text-3xl font-bold tracking-tight text-white">
                  {{ props.productCount }}
                </p>
                <p class="mt-2 text-[0.68rem] font-semibold uppercase tracking-[0.2em] text-slate-400">
                  Published products
                </p>
              </div>

              <div class="rounded-xl border border-white/8 bg-slate-900/60 p-5">
                <p class="text-3xl font-bold tracking-tight text-white">
                  {{ props.categoryCount }}
                </p>
                <p class="mt-2 text-[0.68rem] font-semibold uppercase tracking-[0.2em] text-slate-400">
                  Shop categories
                </p>
              </div>
            </div>

            <div class="mt-6 rounded-xl border border-amber-400/18 bg-amber-400/8 p-5">
              <p class="text-sm leading-7 text-slate-200">
                Next steps can extend this exact language into catalog, product
                detail, and cart pages without changing the underlying project
                architecture.
              </p>
            </div>
          </div>
        </div>
      </StorefrontSectionCard>
    </StorefrontPageContainer>
  </section>
</template>
