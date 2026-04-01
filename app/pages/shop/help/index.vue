<script setup lang="ts">
import {
  storefrontFaqItems,
  storefrontHelpCards,
} from "../_data/storefront-content";

definePageMeta({
  layout: "shop",
});
</script>

<template>
  <div class="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-6 sm:px-6 lg:px-8">
    <section
      class="overflow-hidden rounded-xl bg-white/95 p-6 shadow-sm md:p-8"
    >
      <div class="grid gap-6 lg:grid-cols-[minmax(0,1.15fr)_320px] lg:items-end">
        <div>
          <p class="text-xs uppercase tracking-[0.22em] text-amber-600">
            Help Center
          </p>
          <h1 class="mt-3 text-3xl font-semibold tracking-tight text-slate-900 md:text-4xl">
            Give buyers answers before uncertainty slows the order.
          </h1>
          <p class="mt-3 max-w-3xl text-sm leading-7 text-slate-600 md:text-base">
            This page adds the missing support layer many storefronts need: practical
            guidance on how to browse, order, and prepare deliveries.
          </p>
        </div>

        <div class="rounded-lg bg-slate-50/80 p-5">
          <p class="text-sm text-slate-500">Quick next step</p>
          <p class="mt-2 text-2xl font-semibold text-slate-900">
            Continue to shop
          </p>
          <p class="mt-2 text-sm leading-6 text-slate-600">
            Once the buyer is ready, they can return to the catalog and move into cart.
          </p>
        </div>
      </div>
    </section>

    <section class="grid gap-4 md:grid-cols-3">
      <article
        v-for="card in storefrontHelpCards"
        :key="card.title"
        class="rounded-xl bg-white/95 p-6 shadow-sm"
      >
        <div class="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-900 text-white">
          <UIcon :name="card.icon" class="text-lg" />
        </div>
        <h2 class="mt-4 text-xl font-semibold text-slate-900">
          {{ card.title }}
        </h2>
        <p class="mt-2 text-sm leading-7 text-slate-600">
          {{ card.description }}
        </p>
      </article>
    </section>

    <section class="rounded-xl bg-white/95 p-6 shadow-sm md:p-8">
      <p class="text-xs uppercase tracking-[0.22em] text-amber-600">
        Frequently Asked Questions
      </p>
      <div class="mt-6 grid gap-4 md:grid-cols-2">
        <article
          v-for="item in storefrontFaqItems"
          :key="item.question"
          class="rounded-lg bg-slate-50/80 p-5"
        >
          <h2 class="text-lg font-semibold text-slate-900">
            {{ item.question }}
          </h2>
          <p class="mt-2 text-sm leading-6 text-slate-600">
            {{ item.answer }}
          </p>
        </article>
      </div>
    </section>

    <section class="grid gap-4 md:grid-cols-3">
      <NuxtLink
        to="/shop"
        class="rounded-xl bg-white/95 p-6 shadow-sm transition duration-200 hover:bg-amber-50/30"
      >
        <h2 class="text-xl font-semibold text-slate-900">
          Return to storefront
        </h2>
        <p class="mt-2 text-sm leading-6 text-slate-600">
          Browse the upgraded product catalog and continue shopping.
        </p>
      </NuxtLink>

      <NuxtLink
        to="/cart"
        class="rounded-xl bg-white/95 p-6 shadow-sm transition duration-200 hover:bg-amber-50/30"
      >
        <h2 class="text-xl font-semibold text-slate-900">
          Review cart
        </h2>
        <p class="mt-2 text-sm leading-6 text-slate-600">
          Check selected items before moving into the checkout flow.
        </p>
      </NuxtLink>

      <NuxtLink
        to="/auth/register"
        class="rounded-xl bg-white/95 p-6 shadow-sm transition duration-200 hover:bg-amber-50/30"
      >
        <h2 class="text-xl font-semibold text-slate-900">
          Create buyer account
        </h2>
        <p class="mt-2 text-sm leading-6 text-slate-600">
          Register first if the customer wants easier repeat ordering and history access.
        </p>
      </NuxtLink>
    </section>
  </div>
</template>
