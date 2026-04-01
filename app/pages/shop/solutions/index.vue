<script setup lang="ts">
definePageMeta({
  layout: "shop",
});

const solutionGroups = [
  {
    title: "Core Build Supply",
    description:
      "For teams sourcing structural materials and recurring essentials where price clarity and dependable stock matter most.",
    highlights: [
      "Clear stock and unit pricing for faster approvals",
      "Category-led browsing for large product catalogs",
      "Best fit for repeat procurement workflows",
    ],
  },
  {
    title: "Project Kickoff Shortlist",
    description:
      "A cleaner way for new customers to browse, compare, and build their first shortlist before checkout.",
    highlights: [
      "Less friction for first-time buyers",
      "Useful guidance across categories and FAQs",
      "Designed to move shoppers toward cart with fewer questions",
    ],
  },
  {
    title: "Fast Restocking Flow",
    description:
      "When the team already knows what it needs, the refreshed shop supports quick search, product review, and reorder-style behavior.",
    highlights: [
      "Header search remains available across the storefront",
      "Product cards surface key buying signals immediately",
      "Cart and checkout remain one short path away",
    ],
  },
] as const;
</script>

<template>
  <div class="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-6 sm:px-6 lg:px-8">
    <section
      class="overflow-hidden rounded-xl bg-white/95 p-6 shadow-sm md:p-8"
    >
      <div class="grid gap-6 lg:grid-cols-[minmax(0,1.1fr)_340px] lg:items-end">
        <div>
          <p class="text-xs uppercase tracking-[0.22em] text-amber-600">
            Buying Solutions
          </p>
          <h1 class="mt-3 text-3xl font-semibold tracking-tight text-slate-900 md:text-4xl">
            Pages and sections designed to turn catalog browsing into confident orders.
          </h1>
          <p class="mt-3 max-w-3xl text-sm leading-7 text-slate-600 md:text-base">
            This page frames the storefront around real customer intentions: sourcing,
            shortlisting, and fast replenishment.
          </p>
        </div>

        <div class="rounded-xl bg-slate-900 p-5 text-white">
          <p class="text-sm text-slate-300">Design direction</p>
          <p class="mt-2 text-2xl font-semibold">Industrial minimalism</p>
          <p class="mt-2 text-sm leading-6 text-slate-300">
            Strong typography, muted surfaces, amber accents, and clearer conversion paths.
          </p>
        </div>
      </div>
    </section>

    <section class="grid gap-4 lg:grid-cols-3">
      <article
        v-for="group in solutionGroups"
        :key="group.title"
        class="rounded-xl bg-white/95 p-6 shadow-sm"
      >
        <h2 class="text-2xl font-semibold tracking-tight text-slate-900">
          {{ group.title }}
        </h2>
        <p class="mt-3 text-sm leading-7 text-slate-600">
          {{ group.description }}
        </p>

        <div class="mt-5 space-y-3">
          <div
            v-for="highlight in group.highlights"
            :key="highlight"
            class="flex items-start gap-3 rounded-lg bg-slate-50/80 px-4 py-3"
          >
            <UIcon name="i-lucide-check" class="mt-0.5 text-base text-amber-600" />
            <p class="text-sm leading-6 text-slate-700">
              {{ highlight }}
            </p>
          </div>
        </div>
      </article>
    </section>

    <section class="grid gap-4 md:grid-cols-3">
      <NuxtLink
        to="/shop"
        class="rounded-xl bg-white/95 p-6 shadow-sm transition duration-200 hover:bg-amber-50/30"
      >
        <p class="text-xs uppercase tracking-[0.18em] text-slate-500">
          Storefront
        </p>
        <h2 class="mt-2 text-xl font-semibold text-slate-900">
          Browse products
        </h2>
        <p class="mt-2 text-sm leading-6 text-slate-600">
          Open the refreshed catalog with improved cards, sections, and filtering.
        </p>
      </NuxtLink>

      <NuxtLink
        to="/shop/categories"
        class="rounded-xl bg-white/95 p-6 shadow-sm transition duration-200 hover:bg-amber-50/30"
      >
        <p class="text-xs uppercase tracking-[0.18em] text-slate-500">
          Discovery
        </p>
        <h2 class="mt-2 text-xl font-semibold text-slate-900">
          Explore categories
        </h2>
        <p class="mt-2 text-sm leading-6 text-slate-600">
          Give buyers a simpler starting point before they search by exact product.
        </p>
      </NuxtLink>

      <NuxtLink
        to="/shop/help"
        class="rounded-xl bg-white/95 p-6 shadow-sm transition duration-200 hover:bg-amber-50/30"
      >
        <p class="text-xs uppercase tracking-[0.18em] text-slate-500">
          Support
        </p>
        <h2 class="mt-2 text-xl font-semibold text-slate-900">
          Open help center
        </h2>
        <p class="mt-2 text-sm leading-6 text-slate-600">
          Reduce hesitation with ordering guidance, delivery notes, and FAQs.
        </p>
      </NuxtLink>
    </section>
  </div>
</template>
