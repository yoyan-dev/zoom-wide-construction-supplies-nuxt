<template>
  <section class="rounded-[32px] border border-amber-200/60 bg-gradient-to-r from-amber-100 via-white to-stone-100 p-6 shadow-sm sm:p-8">
    <div class="grid gap-6 lg:grid-cols-[minmax(0,1.1fr)_auto] lg:items-center">
      <div>
        <p class="text-xs uppercase tracking-[0.22em] text-amber-700">
          Keep Browsing
        </p>
        <h2 class="mt-3 text-3xl font-semibold text-slate-900">
          Need more materials for your next delivery window?
        </h2>
        <p class="mt-3 max-w-2xl text-sm leading-6 text-slate-600">
          Continue browsing categories, build your cart shortlist, or jump into
          product details for supply notes before moving to inquiry or checkout later.
        </p>
      </div>

      <div class="flex flex-wrap gap-3">
        <UButton color="warning" size="lg" to="/shop/categories">
          Browse Categories
        </UButton>
        <UButton color="neutral" variant="outline" size="lg" to="/shop">
          Shop More Products
        </UButton>
      </div>
    </div>
  </section>
</template>
