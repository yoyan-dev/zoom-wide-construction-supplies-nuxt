<script setup lang="ts">
definePageMeta({
  layout: "warehouse",
});

const helpCards = [
  {
    title: "Inventory Handling",
    description: "Track stock movement, adjustments, and low-stock monitoring procedures.",
  },
  {
    title: "Dispatch Support",
    description: "Coordinate pending deliveries and warehouse-side release steps for outbound orders.",
  },
  {
    title: "Warehouse Users",
    description: "Review user access and assignment visibility for warehouse operations.",
  },
];
</script>

<template>
  <div class="min-h-screen space-y-6">
    <section class="rounded-3xl border border-slate-200/70 bg-white p-6 shadow-sm md:p-8">
      <p class="text-xs uppercase tracking-[0.18em] text-slate-500">
        Warehouse Help
      </p>
      <h1 class="mt-2 text-2xl font-semibold md:text-3xl">Help and support</h1>
      <p class="mt-2 max-w-3xl text-sm text-slate-600 md:text-base">
        Warehouse reference page for common inventory, dispatch, and user-assignment workflows.
      </p>
    </section>

    <div class="grid gap-4 md:grid-cols-3">
      <UCard v-for="card in helpCards" :key="card.title">
        <p class="text-lg font-semibold text-slate-900">{{ card.title }}</p>
        <p class="mt-2 text-sm leading-6 text-slate-600">{{ card.description }}</p>
      </UCard>
    </div>
  </div>
</template>
