<script setup lang="ts">
definePageMeta({
  layout: "admin",
});

const supportCards = [
  {
    title: "Platform Support",
    description:
      "Check common admin tasks, page ownership, and escalation paths for operations issues.",
    icon: "i-lucide-life-buoy",
  },
  {
    title: "Data Review",
    description:
      "Use reports, orders, inventory, and delivery pages to validate the current operational state before escalating.",
    icon: "i-lucide-file-search",
  },
  {
    title: "Team Handoffs",
    description:
      "Coordinate with staff, warehouse, finance, and auditor roles when a workflow needs multi-role follow-up.",
    icon: "i-lucide-users",
  },
];
</script>

<template>
  <div class="min-h-screen space-y-6">
    <section class="rounded-3xl border border-slate-200/70 bg-white p-6 shadow-sm md:p-8">
      <p class="text-xs uppercase tracking-[0.18em] text-slate-500">
        Admin Help
      </p>
      <h1 class="mt-2 text-2xl font-semibold md:text-3xl">Help and support</h1>
      <p class="mt-2 max-w-3xl text-sm text-slate-600 md:text-base">
        Use this page as the landing point for admin-side support, workflow
        guidance, and cross-role coordination.
      </p>
    </section>

    <div class="grid gap-4 md:grid-cols-3">
      <UCard v-for="card in supportCards" :key="card.title">
        <div class="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-100 text-slate-700">
          <UIcon :name="card.icon" class="h-5 w-5" />
        </div>
        <p class="mt-4 text-lg font-semibold text-slate-900">{{ card.title }}</p>
        <p class="mt-2 text-sm leading-6 text-slate-600">{{ card.description }}</p>
      </UCard>
    </div>
  </div>
</template>
