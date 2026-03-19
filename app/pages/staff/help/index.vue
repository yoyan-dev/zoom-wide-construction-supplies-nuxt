<script setup lang="ts">
definePageMeta({
  layout: "staff",
});

const helpTopics = [
  "Order follow-up and approval checks",
  "Customer inquiry handling",
  "Delivery coordination handoff",
  "Low stock escalation flow",
];
</script>

<template>
  <div class="min-h-screen space-y-6">
    <section class="rounded-3xl border border-slate-200/70 bg-white p-6 shadow-sm md:p-8">
      <p class="text-xs uppercase tracking-[0.18em] text-slate-500">
        Staff Help
      </p>
      <h1 class="mt-2 text-2xl font-semibold md:text-3xl">Support and guidance</h1>
      <p class="mt-2 max-w-3xl text-sm text-slate-600 md:text-base">
        Quick reference for the main staff workflows across orders, customers,
        products, deliveries, and reports.
      </p>
    </section>

    <UCard>
      <div class="mb-4">
        <p class="text-xs uppercase tracking-[0.18em] text-slate-500">
          Common Topics
        </p>
        <p class="mt-1 text-lg font-semibold">Operational guidance</p>
      </div>
      <div class="grid gap-3 md:grid-cols-2">
        <div
          v-for="topic in helpTopics"
          :key="topic"
          class="rounded-2xl border border-slate-200/70 bg-slate-50 px-4 py-3 text-sm text-slate-700"
        >
          {{ topic }}
        </div>
      </div>
    </UCard>
  </div>
</template>
