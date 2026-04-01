<script setup lang="ts">
const props = defineProps<{
  total: number;
  categoryCount: number;
  search: string;
  activeCategoryLabel: string;
}>();

const searchLabel = computed(() =>
  props.search ? `"${props.search}"` : "No search term applied",
);
</script>

<template>
  <section
    class="rounded-xl bg-white/95 shadow-sm relative overflow-hidden p-5 md:p-8"
  >
    <div
      class="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-amber-200/40 blur-3xl"
    />
    <div
      class="pointer-events-none absolute -bottom-20 -left-16 h-60 w-60 rounded-full bg-slate-200/50 blur-3xl"
    />

    <div class="relative grid gap-6 xl:grid-cols-[minmax(0,1.12fr)_340px] xl:items-end">
      <div class="max-w-3xl">
        <p class="text-xs uppercase tracking-[0.22em] text-amber-600">
          Buyer Storefront
        </p>
        <h1 class="mt-3 text-3xl font-semibold tracking-tight text-slate-900 md:text-5xl">
          Source construction materials faster with a cleaner, decision-first catalog.
        </h1>
        <p class="mt-4 max-w-2xl text-sm leading-7 text-slate-600 md:text-base">
          Compare stock, price, and category context at a glance, then move directly
          into product details or cart without losing your browsing momentum.
        </p>

        <div class="mt-6 flex flex-wrap gap-3">
          <UButton color="warning" size="lg" class="rounded-lg font-semibold shadow-sm" to="/shop/categories">
            Explore categories
          </UButton>
          <UButton color="neutral" variant="outline" size="lg" class="rounded-lg font-semibold" to="/cart">
            Open cart
          </UButton>
        </div>

        <div class="mt-6 grid gap-3 sm:grid-cols-2 lg:max-w-xl">
          <article class="rounded-lg bg-slate-50/80 px-4 py-3">
            <p class="text-xs uppercase tracking-[0.18em] text-slate-500">
              Active products
            </p>
            <p class="mt-2 text-2xl font-semibold text-slate-900">
              {{ props.total }}
            </p>
          </article>
          <article class="rounded-lg bg-slate-50/80 px-4 py-3">
            <p class="text-xs uppercase tracking-[0.18em] text-slate-500">
              Categories
            </p>
            <p class="mt-2 text-2xl font-semibold text-slate-900">
              {{ props.categoryCount }}
            </p>
          </article>
        </div>
      </div>

      <div class="grid gap-4 sm:grid-cols-2 xl:grid-cols-1">
        <div class="rounded-lg bg-slate-50/80 p-5">
          <p class="text-xs uppercase tracking-[0.18em] text-slate-500">
            Current view
          </p>
          <p class="mt-2 text-xl font-semibold text-slate-900">
            {{ props.activeCategoryLabel }}
          </p>
          <p class="mt-2 text-sm leading-6 text-slate-600">
            Products are currently grouped to help teams shortlist options faster.
          </p>
        </div>

        <div class="rounded-xl bg-slate-900 p-5 text-white">
          <p class="text-xs uppercase tracking-[0.18em] text-amber-300">
            Search status
          </p>
          <p class="mt-2 text-xl font-semibold">
            {{ searchLabel }}
          </p>
          <p class="mt-2 text-sm leading-6 text-slate-300">
            Use category chips below to narrow results while keeping your current query.
          </p>
        </div>
      </div>
    </div>
  </section>
</template>
