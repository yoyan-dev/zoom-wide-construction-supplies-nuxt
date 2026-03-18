<script setup lang="ts">
import type { StorefrontStep } from "./storefront.data";
import StorefrontSectionHeader from "./StorefrontSectionHeader.vue";

const props = defineProps<{
  steps: StorefrontStep[];
}>();
</script>

<template>
  <section class="rounded-[32px] border border-slate-200/70 bg-gradient-to-br from-slate-950 via-slate-900 to-stone-900 p-6 text-white shadow-sm sm:p-8">
    <StorefrontSectionHeader
      eyebrow="How Ordering Works"
      title="A simpler supply flow for buyers"
      description="The homepage is structured to help teams go from discovery to shortlist quickly."
      invert
    />

    <div class="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      <div
        v-for="(step, index) in props.steps"
        :key="step.id"
        class="rounded-[24px] border border-white/10 bg-white/5 p-5 backdrop-blur"
      >
        <div class="flex items-center justify-between">
          <div class="flex h-11 w-11 items-center justify-center rounded-2xl bg-amber-300/15 text-amber-300">
            <UIcon :name="step.icon" class="text-xl" />
          </div>
          <span class="text-xs uppercase tracking-[0.18em] text-slate-400">
            Step {{ index + 1 }}
          </span>
        </div>
        <h3 class="mt-4 text-lg font-semibold">
          {{ step.title }}
        </h3>
        <p class="mt-2 text-sm leading-6 text-slate-300">
          {{ step.description }}
        </p>
      </div>
    </div>
  </section>
</template>
