<script setup lang="ts">
const props = defineProps<{
  total: number;
}>();

const orderLabel = computed(() => {
  if (!props.total) {
    return "Track your submitted orders here once they become available.";
  }

  return `${props.total} order${props.total === 1 ? "" : "s"} available for review`;
});
</script>

<template>
  <section class="rounded-[32px] border border-slate-200/70 bg-white p-6 shadow-sm md:p-8">
    <div class="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
      <div>
        <p class="text-xs uppercase tracking-[0.22em] text-amber-600">
          Buyer Orders
        </p>
        <h1 class="mt-3 text-3xl font-semibold tracking-tight text-slate-900">
          My Orders
        </h1>
        <p class="mt-3 text-sm leading-7 text-slate-600">
          {{ orderLabel }}
        </p>
      </div>

      <div class="flex flex-wrap items-center gap-3">
        <UButton color="neutral" variant="outline" to="/shop">
          Continue Shopping
        </UButton>
      </div>
    </div>
  </section>
</template>
