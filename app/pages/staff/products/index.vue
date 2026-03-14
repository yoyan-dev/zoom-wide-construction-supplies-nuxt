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
          Products Management
        </p>
        <h1 class="mt-2 text-2xl font-semibold">Catalog Workspace</h1>
        <p class="mt-2 text-sm text-slate-600">
          Manage products available for ordering and inventory tracking.
        </p>
      </section>

      <UCard>
        <div class="mb-4">
          <p class="text-xs uppercase tracking-[0.18em] text-slate-500">
            Core Actions
          </p>
          <p class="mt-1 text-lg font-semibold">What staff can do</p>
        </div>
        <div class="grid gap-3 sm:grid-cols-2">
          <div class="rounded-xl border border-slate-200/70 bg-slate-50 p-4">
            Products list
          </div>
          <div class="rounded-xl border border-slate-200/70 bg-slate-50 p-4">
            Edit product
          </div>
          <div class="rounded-xl border border-slate-200/70 bg-slate-50 p-4">
            Add product (optional depending on permission)
          </div>
        </div>
      </UCard>
    </div>
  </div>
</template>
