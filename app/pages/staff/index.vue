<script setup lang="ts">
definePageMeta({
  layout: "staff",
});
</script>

<template>
  <div class="min-h-screen bg-slate-50/40">
    <div class="mx-auto max-w-5xl space-y-6">
      <section class="rounded-2xl border border-slate-200/70 bg-white p-6">
        <p class="text-xs uppercase tracking-[0.18em] text-slate-500">
          Manager / Staff Pages
        </p>
        <h1 class="mt-2 text-2xl font-semibold">Operations Hub</h1>
        <p class="mt-2 text-sm text-slate-600">
          Managers handle operations and order management.
        </p>
      </section>

      <UCard>
        <div class="mb-4">
          <p class="text-xs uppercase tracking-[0.18em] text-slate-500">
            Quick Access
          </p>
          <p class="mt-1 text-lg font-semibold">Staff Workspaces</p>
        </div>
        <div class="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <UButton color="primary" variant="soft" to="/staff/orders">
            Orders Management
          </UButton>
          <UButton color="primary" variant="soft" to="/staff/products">
            Products Management
          </UButton>
          <UButton color="primary" variant="soft" to="/staff/customers">
            Customers
          </UButton>
          <UButton color="primary" variant="soft" to="/staff/deliveries">
            Deliveries
          </UButton>
          <UButton color="primary" variant="soft" to="/staff/reports">
            Reports
          </UButton>
        </div>
      </UCard>
    </div>
  </div>
</template>
