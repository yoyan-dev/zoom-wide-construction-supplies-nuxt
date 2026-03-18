<script setup lang="ts">
import StorefrontSearchBar from "./StorefrontSearchBar.vue";

const props = defineProps<{
  search: string;
  quickTerms: string[];
}>();

const emit = defineEmits<{
  (e: "update:search", value: string): void;
  (e: "search"): void;
}>();
</script>

<template>
  <section class="relative overflow-hidden rounded-[36px] border border-slate-200/70 bg-gradient-to-br from-stone-950 via-slate-900 to-amber-950 px-6 py-8 text-white shadow-sm sm:px-8 sm:py-10 lg:px-10 lg:py-12">
    <div class="absolute inset-y-0 right-0 hidden w-1/2 bg-[radial-gradient(circle_at_top_right,rgba(251,191,36,0.26),transparent_46%),radial-gradient(circle_at_bottom_right,rgba(14,165,233,0.18),transparent_35%)] lg:block" />

    <div class="relative grid gap-8 lg:grid-cols-[minmax(0,1.15fr)_minmax(280px,0.85fr)] lg:items-center">
      <div>
        <p class="text-xs uppercase tracking-[0.24em] text-amber-300">
          Construction Supply Marketplace
        </p>
        <h1 class="mt-4 max-w-3xl text-4xl font-semibold leading-tight sm:text-5xl">
          Shop jobsite materials faster with a product-first buying flow.
        </h1>
        <p class="mt-4 max-w-2xl text-sm leading-7 text-slate-200 sm:text-base">
          Browse cement, steel, roofing, electrical, plumbing, boards, and hardware
          in a storefront built for practical supply buying.
        </p>

        <div class="mt-8 max-w-3xl rounded-[28px] border border-white/10 bg-white/8 p-4 backdrop-blur">
          <StorefrontSearchBar
            :model-value="props.search"
            :quick-terms="props.quickTerms"
            @update:model-value="emit('update:search', $event)"
            @submit="emit('search')"
            @quick-term="
              ($event) => {
                emit('update:search', $event);
                emit('search');
              }
            "
          />
        </div>

        <div class="mt-6 flex flex-wrap gap-3">
          <UButton color="warning" size="lg" to="#browse-products">
            Shop Products
          </UButton>
          <UButton color="neutral" variant="soft" size="lg" to="/shop/categories">
            Browse Categories
          </UButton>
        </div>
      </div>

      <div class="grid gap-4 sm:grid-cols-3 lg:grid-cols-1">
        <div class="rounded-[28px] border border-white/10 bg-white/10 p-5 backdrop-blur">
          <p class="text-xs uppercase tracking-[0.18em] text-slate-300">
            In-Demand
          </p>
          <p class="mt-3 text-2xl font-semibold">Cement and ready-mix</p>
          <p class="mt-2 text-sm leading-6 text-slate-200">
            Fast-moving core materials for slabs, columns, patch work, and pours.
          </p>
        </div>
        <div class="rounded-[28px] border border-white/10 bg-white/10 p-5 backdrop-blur">
          <p class="text-xs uppercase tracking-[0.18em] text-slate-300">
            Trade Supply
          </p>
          <p class="mt-3 text-2xl font-semibold">Electrical and plumbing</p>
          <p class="mt-2 text-sm leading-6 text-slate-200">
            Compare GI pipes, conduit, wire, valves, and fittings quickly.
          </p>
        </div>
        <div class="rounded-[28px] border border-white/10 bg-white/10 p-5 backdrop-blur">
          <p class="text-xs uppercase tracking-[0.18em] text-slate-300">
            Buyer Signal
          </p>
          <p class="mt-3 text-2xl font-semibold">Stock-first browsing</p>
          <p class="mt-2 text-sm leading-6 text-slate-200">
            Cards surface pricing and availability early so buyers can shortlist
            with confidence.
          </p>
        </div>
      </div>
    </div>
  </section>
</template>
