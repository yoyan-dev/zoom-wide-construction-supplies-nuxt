<script setup lang="ts">
import type { Product } from "~/types/product";

const props = defineProps<{
  product: Product;
}>();

const specificationList = computed(
  () => props.product.handbook?.specifications ?? [],
);
</script>

<template>
  <UCard>
    <div>
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
          class="rounded-lg border border-slate-200/70 p-4"
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
    </div>
  </UCard>
</template>
