<script setup lang="ts">
import type { Product } from "~/types/product";

const props = defineProps<{
  product: Product;
}>();

const featureList = computed(() => props.product.handbook?.features ?? []);
const applicationList = computed(() => props.product.handbook?.applications ?? []);
const specificationList = computed(
  () => props.product.handbook?.specifications ?? [],
);

const productDescription = computed(
  () =>
    props.product.description?.trim() ||
    "No product description has been provided for this item.",
);

const handbookSummary = computed(
  () =>
    props.product.handbook?.summary?.trim() ||
    "No additional product summary is available.",
);
</script>

<template>
  <div class="grid gap-6 xl:grid-cols-[minmax(0,1.1fr)_minmax(320px,0.9fr)]">
    <UCard>
      <div class="space-y-5">
        <div>
          <p class="text-xs uppercase tracking-[0.18em] text-slate-500">
            Description
          </p>
          <p class="mt-3 text-sm leading-7 text-slate-700">
            {{ productDescription }}
          </p>
        </div>

        <div>
          <p class="text-xs uppercase tracking-[0.18em] text-slate-500">
            Product Summary
          </p>
          <p class="mt-3 text-sm leading-7 text-slate-700">
            {{ handbookSummary }}
          </p>
        </div>
      </div>
    </UCard>

    <UCard>
      <div class="space-y-5">
        <div>
          <p class="text-xs uppercase tracking-[0.18em] text-slate-500">
            Key Features
          </p>
          <div v-if="featureList.length" class="mt-3 flex flex-wrap gap-2">
            <UBadge
              v-for="feature in featureList"
              :key="feature"
              color="info"
              variant="subtle"
            >
              {{ feature }}
            </UBadge>
          </div>
          <p v-else class="mt-3 text-sm text-slate-600">
            No key features listed.
          </p>
        </div>

        <div>
          <p class="text-xs uppercase tracking-[0.18em] text-slate-500">
            Typical Applications
          </p>
          <div v-if="applicationList.length" class="mt-3 grid gap-2">
            <div
              v-for="application in applicationList"
              :key="application"
              class="rounded-2xl border border-slate-200/70 px-3 py-2 text-sm text-slate-700"
            >
              {{ application }}
            </div>
          </div>
          <p v-else class="mt-3 text-sm text-slate-600">
            No applications listed.
          </p>
        </div>
      </div>
    </UCard>

    <UCard class="xl:col-span-2">
      <p class="text-xs uppercase tracking-[0.18em] text-slate-500">
        Specifications
      </p>
      <div
        v-if="specificationList.length"
        class="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-3"
      >
        <div
          v-for="specification in specificationList"
          :key="`${specification.label}-${specification.value}`"
          class="rounded-2xl border border-slate-200/70 p-4"
        >
          <p class="text-xs uppercase tracking-[0.18em] text-slate-500">
            {{ specification.label }}
          </p>
          <p class="mt-2 text-sm font-medium text-slate-800">
            {{ specification.value }}
          </p>
        </div>
      </div>
      <p v-else class="mt-3 text-sm text-slate-600">
        No specifications have been added for this product.
      </p>
    </UCard>
  </div>
</template>
