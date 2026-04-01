<script setup lang="ts">
import { storefrontTrustPoints } from "../_data/storefront-content";
</script>

<template>
  <section class="grid gap-4 xl:grid-cols-[minmax(0,1.25fr)_minmax(280px,0.75fr)]">
    <div class="rounded-xl bg-white/95 shadow-sm p-6 md:p-8">
      <p class="text-xs uppercase tracking-[0.22em] text-amber-600">
        Why Buyers Trust It
      </p>
      <h2 class="mt-3 text-2xl font-semibold tracking-tight text-slate-900 md:text-3xl">
        Built for fast procurement without sacrificing clarity.
      </h2>
      <p class="mt-3 max-w-3xl text-sm leading-7 text-slate-600">
        The updated storefront uses cleaner hierarchy, stronger card grouping, and
        obvious next actions so teams can move from browse to checkout with less friction.
      </p>

      <div class="mt-6 grid gap-4 md:grid-cols-2">
        <article
          v-for="point in storefrontTrustPoints"
          :key="point.title"
          class="rounded-lg bg-slate-50/80 p-5"
        >
          <div class="flex items-start gap-4">
            <div class="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-900 text-white">
              <UIcon :name="point.icon" class="text-lg" />
            </div>
            <div>
              <p class="text-xs uppercase tracking-[0.18em] text-slate-500">
                {{ point.accent }}
              </p>
              <h3 class="mt-2 text-lg font-semibold text-slate-900">
                {{ point.title }}
              </h3>
              <p class="mt-2 text-sm leading-6 text-slate-600">
                {{ point.description }}
              </p>
            </div>
          </div>
        </article>
      </div>
    </div>

    <aside class="rounded-xl bg-slate-900 p-6 text-white shadow-sm md:p-8">
      <p class="text-xs uppercase tracking-[0.22em] text-amber-300/90">
        Conversion Focus
      </p>
      <h3 class="mt-3 text-2xl font-semibold tracking-tight">
        Keep decisions simple for first-time and repeat buyers.
      </h3>
      <p class="mt-3 text-sm leading-7 text-slate-300">
        Key sections surface category entry points, order confidence details, and clear
        cart/checkout actions so users always know the next move.
      </p>

      <div class="mt-8 space-y-3">
        <div class="rounded-lg bg-white/5 p-4">
          <p class="text-sm text-slate-300">Best next stop</p>
          <p class="mt-1 text-lg font-semibold text-white">Browse by category</p>
        </div>
        <div class="rounded-lg bg-white/5 p-4">
          <p class="text-sm text-slate-300">Customer confidence booster</p>
          <p class="mt-1 text-lg font-semibold text-white">Help and ordering guidance</p>
        </div>
      </div>

      <div class="mt-8 flex flex-col gap-3">
        <UButton color="warning" size="lg" to="/shop/categories">
          Explore categories
        </UButton>
        <UButton color="neutral" variant="soft" size="lg" to="/shop/help">
          Open help center
        </UButton>
      </div>
    </aside>
  </section>
</template>
