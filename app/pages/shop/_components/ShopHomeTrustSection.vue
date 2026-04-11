<script setup lang="ts">
const props = defineProps<{
  productCount: number;
  categoryCount: number;
}>();

const highlights = [
  {
    icon: "i-lucide-badge-check",
    title: "Specification-ready supply",
    description:
      "Clear product details, category guidance, and stock visibility help buyers compare materials with confidence.",
  },
  {
    icon: "i-lucide-truck",
    title: "Delivery-first coordination",
    description:
      "Freight planning, delivery notes, and order context stay visible before the request is submitted.",
  },
  {
    icon: "i-lucide-ruler",
    title: "Built for repeat projects",
    description:
      "Contractors can move from category discovery to product shortlist without unnecessary steps.",
  },
] as const;
</script>

<template>
  <section id="trust" class="py-12 md:py-16">
    <StorefrontPageContainer size="wide">
      <StorefrontSectionCard
        class="overflow-hidden bg-white"
        padding="none"
      >
        <div
          class="grid gap-0 lg:grid-cols-[minmax(0,0.92fr)_minmax(0,1.08fr)]"
        >
          <div class="p-6 md:p-8 lg:p-10">
            <p
              class="text-[0.72rem] font-semibold uppercase tracking-[0.18em] text-amber-700"
            >
              About us
            </p>
            <h2
              class="mt-4 max-w-xl text-3xl font-semibold leading-tight text-slate-950 md:text-4xl"
            >
              Built for cleaner construction procurement.
            </h2>
            <p class="mt-5 max-w-2xl text-sm leading-8 text-slate-600 md:text-base">
              ZOOM WIDE keeps the buying path focused on materials, stock
              confidence, and practical decisions for procurement teams that
              need dependable construction supplies.
            </p>

            <div class="mt-9">
              <p
                class="text-[0.72rem] font-semibold uppercase tracking-[0.18em] text-slate-500"
              >
                Why choose us
              </p>

              <div class="mt-5 grid gap-4">
                <div
                  v-for="highlight in highlights"
                  :key="highlight.title"
                  class="flex gap-4 rounded-lg border border-slate-200 bg-slate-50/80 p-4"
                >
                  <div
                    class="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-amber-50 text-amber-700"
                  >
                    <UIcon :name="highlight.icon" class="text-lg" />
                  </div>
                  <div>
                    <h3 class="text-base font-semibold text-slate-950">
                      {{ highlight.title }}
                    </h3>
                    <p class="mt-2 text-sm leading-7 text-slate-600">
                      {{ highlight.description }}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div
            class="border-t border-slate-200 bg-slate-50 p-6 md:p-8 lg:border-l lg:border-t-0 lg:p-10"
          >
            <div class="overflow-hidden rounded-lg border border-slate-200 bg-white">
              <NuxtImg
                src="https://images.unsplash.com/photo-1503387762-592deb58ef4e?auto=format&fit=crop&w=1200&q=80"
                alt="Architectural blueprint and construction planning materials"
                class="h-[260px] w-full object-cover md:h-[340px]"
                loading="lazy"
              />
            </div>

            <div class="mt-6 grid gap-4 sm:grid-cols-2">
              <div class="rounded-lg border border-slate-200 bg-white p-5">
                <p class="text-3xl font-semibold tracking-tight text-slate-950">
                  {{ props.productCount }}
                </p>
                <p
                  class="mt-2 text-[0.68rem] font-semibold uppercase tracking-[0.16em] text-slate-500"
                >
                  Published products
                </p>
              </div>

              <div class="rounded-lg border border-slate-200 bg-white p-5">
                <p class="text-3xl font-semibold tracking-tight text-slate-950">
                  {{ props.categoryCount }}
                </p>
                <p
                  class="mt-2 text-[0.68rem] font-semibold uppercase tracking-[0.16em] text-slate-500"
                >
                  Shop categories
                </p>
              </div>
            </div>

            <div
              class="mt-6 rounded-lg border border-amber-200 bg-amber-50 p-5"
            >
              <p class="text-sm leading-7 text-amber-900">
                Product selection, order review, and delivery planning stay
                connected from the first category browse through checkout.
              </p>
            </div>
          </div>
        </div>
      </StorefrontSectionCard>
    </StorefrontPageContainer>
  </section>
</template>
