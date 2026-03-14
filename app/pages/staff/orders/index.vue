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
          Orders Management
        </p>
        <h1 class="mt-2 text-2xl font-semibold">Orders Workspace</h1>
        <p class="mt-2 text-sm text-slate-600">
          Manage the full order lifecycle from intake to fulfillment.
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
            Orders list
          </div>
          <div class="rounded-xl border border-slate-200/70 bg-slate-50 p-4">
            Order details
          </div>
          <div class="rounded-xl border border-slate-200/70 bg-slate-50 p-4">
            Update order status
          </div>
          <div class="rounded-xl border border-slate-200/70 bg-slate-50 p-4">
            Assign delivery
          </div>
        </div>
      </UCard>
    </div>
  </div>
</template>
