<script setup lang="ts">
import type { Product } from "~/types/product";

const props = defineProps<{
  product: Product;
}>();

const featureList = computed(() => props.product.handbook?.features ?? []);
const applicationList = computed(
  () => props.product.handbook?.applications ?? [],
);
</script>

<template>
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
        <p v-else class="mt-2 text-sm text-slate-600">
          No key features listed.
        </p>
      </div>

      <div>
        <p class="text-xs uppercase tracking-[0.18em] text-slate-500">
          Applications
        </p>
        <ul v-if="applicationList.length" class="mt-3 space-y-2 text-sm text-slate-700">
          <li
            v-for="application in applicationList"
            :key="application"
            class="rounded-lg border border-slate-200/70 px-3 py-2"
          >
            {{ application }}
          </li>
        </ul>
        <p v-else class="mt-2 text-sm text-slate-600">
          No applications listed.
        </p>
      </div>
    </div>
  </UCard>
</template>
