<script setup lang="ts">
definePageMeta({
  layout: "admin",
});

const securityItems = [
  "Role-based access review",
  "Privileged action confirmations",
  "Session and account monitoring",
  "Audit-friendly change handling",
];
</script>

<template>
  <div class="min-h-screen space-y-6">
    <section class="rounded-3xl border border-slate-200/70 bg-white p-6 shadow-sm md:p-8">
      <p class="text-xs uppercase tracking-[0.18em] text-slate-500">
        Admin Settings
      </p>
      <h1 class="mt-2 text-2xl font-semibold md:text-3xl">Security settings</h1>
      <p class="mt-2 max-w-3xl text-sm text-slate-600 md:text-base">
        Overview of the security areas admins should monitor across the platform.
      </p>
    </section>

    <UCard>
      <div class="mb-4">
        <p class="text-xs uppercase tracking-[0.18em] text-slate-500">
          Security Areas
        </p>
        <p class="mt-1 text-lg font-semibold">Admin review checklist</p>
      </div>
      <div class="grid gap-3 md:grid-cols-2">
        <div
          v-for="item in securityItems"
          :key="item"
          class="rounded-2xl border border-slate-200/70 bg-slate-50 px-4 py-3 text-sm text-slate-700"
        >
          {{ item }}
        </div>
      </div>
    </UCard>
  </div>
</template>
