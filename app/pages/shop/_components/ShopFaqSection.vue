<script setup lang="ts">
import { storefrontFaqItems } from "../_data/storefront-content";
</script>

<template>
  <section class="space-y-5">
    <div class="max-w-2xl">
      <p class="text-xs uppercase tracking-[0.22em] text-amber-600">
        Buyer Questions
      </p>
      <h2 class="mt-2 text-2xl font-semibold tracking-tight text-slate-900 md:text-3xl">
        Clear answers for first-time and repeat customers.
      </h2>
      <p class="mt-3 text-sm leading-7 text-slate-600">
        FAQs reduce hesitation and give buyers more confidence to keep moving through
        the catalog, cart, and checkout flow.
      </p>
    </div>

    <div class="grid gap-4 md:grid-cols-2">
      <article
        v-for="item in storefrontFaqItems"
        :key="item.question"
        class="rounded-xl bg-white/95 shadow-sm p-5"
      >
        <p class="text-lg font-semibold text-slate-900">
          {{ item.question }}
        </p>
        <p class="mt-3 text-sm leading-6 text-slate-600">
          {{ item.answer }}
        </p>
      </article>
    </div>
  </section>
</template>
