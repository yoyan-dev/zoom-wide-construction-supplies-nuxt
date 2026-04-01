<script setup lang="ts">
import {
  storefrontJourneySteps,
  storefrontSolutionCards,
} from "../_data/storefront-content";
</script>

<template>
  <section class="grid gap-4 xl:grid-cols-[minmax(0,1fr)_minmax(320px,0.92fr)]">
    <div class="rounded-xl bg-white/95 shadow-sm p-6 md:p-8">
      <p class="text-xs uppercase tracking-[0.22em] text-amber-600">
        Procurement Flow
      </p>
      <h2 class="mt-3 text-2xl font-semibold tracking-tight text-slate-900 md:text-3xl">
        A clearer path from browse to order.
      </h2>
      <div class="mt-6 space-y-4">
        <article
          v-for="step in storefrontJourneySteps"
          :key="step.step"
          class="rounded-lg bg-slate-50/80 p-5"
        >
          <div class="flex items-start gap-4">
            <div
              class="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-amber-500 text-base font-semibold text-white"
            >
              {{ step.step }}
            </div>
            <div>
              <h3 class="text-lg font-semibold text-slate-900">
                {{ step.title }}
              </h3>
              <p class="mt-2 text-sm leading-6 text-slate-600">
                {{ step.description }}
              </p>
            </div>
          </div>
        </article>
      </div>
    </div>

    <div class="rounded-xl bg-white/95 shadow-sm p-6 md:p-8">
      <p class="text-xs uppercase tracking-[0.22em] text-amber-600">
        Helpful Pages
      </p>
      <h2 class="mt-3 text-2xl font-semibold tracking-tight text-slate-900">
        Supporting pages that reduce pre-purchase uncertainty.
      </h2>

      <div class="mt-6 space-y-4">
        <NuxtLink
          v-for="card in storefrontSolutionCards"
          :key="card.title"
          :to="card.href"
          class="group rounded-lg bg-slate-50/80 flex items-start justify-between gap-4 p-5 transition duration-200 hover:bg-amber-50/40"
        >
          <div>
            <h3 class="text-lg font-semibold text-slate-900 transition group-hover:text-amber-700">
              {{ card.title }}
            </h3>
            <p class="mt-2 text-sm leading-6 text-slate-600">
              {{ card.description }}
            </p>
          </div>
          <span class="text-sm font-medium text-amber-700">
            {{ card.ctaLabel }}
          </span>
        </NuxtLink>
      </div>
    </div>
  </section>
</template>
