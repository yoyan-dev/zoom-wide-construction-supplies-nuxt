<script setup lang="ts">
import type { Product } from "~/types/product";

const props = defineProps<{
  product: Product | null;
}>();

const emit = defineEmits<{
  (event: "back"): void;
  (event: "edit"): void;
}>();
</script>

<template>
  <section class="rounded-sm bg-white p-2 dark:bg-gray-900">
    <div class="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
      <div>
        <p class="text-xs uppercase tracking-[0.18em] text-slate-500">
          Catalog Details
        </p>
        <h1 class="mt-2 text-2xl font-semibold">
          {{ props.product?.name ?? "Product not found" }}
        </h1>
        <p class="mt-2 text-sm text-slate-600">
          Review pricing, stock readiness, and handbook notes.
        </p>
      </div>
      <div class="flex flex-wrap items-center gap-2">
        <UButton color="neutral" variant="outline" @click="emit('back')">
          Back to Products
        </UButton>
        <UButton v-if="props.product?.id" color="primary" @click="emit('edit')">
          Edit Product
        </UButton>
      </div>
    </div>
  </section>
</template>
