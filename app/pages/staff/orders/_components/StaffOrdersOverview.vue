<script setup lang="ts">
defineProps<{
  total: number;
  needsReview: number;
  activeDeliveryOrders: number;
  completed: number;
}>();
</script>

<template>
  <section
    class="rounded-3xl border border-slate-200/70 bg-[radial-gradient(circle_at_top,_#fff7ed,_#f8fafc_42%,_#eef2ff_100%)] p-6 shadow-sm md:p-8"
  >
    <div class="flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
      <div class="space-y-3">
        <p class="text-xs uppercase tracking-[0.18em] text-slate-500">
          Staff Orders Workspace
        </p>
        <div>
          <h1 class="text-2xl font-semibold md:text-3xl">Order coordination</h1>
          <p class="mt-2 max-w-3xl text-sm text-slate-600 md:text-base">
            Review incoming orders, monitor approvals, and keep dispatch-ready
            jobs moving across the order pipeline.
          </p>
        </div>
        <div class="flex flex-wrap gap-3">
          <UButton icon="i-lucide-refresh-cw" color="neutral" variant="outline">
            Refresh queue
          </UButton>
          <UButton icon="i-lucide-truck" to="/staff/deliveries">
            Open deliveries
          </UButton>
        </div>
      </div>

      <div class="grid gap-3 sm:grid-cols-2 xl:min-w-[460px] xl:grid-cols-4">
        <UCard>
          <p class="text-xs uppercase tracking-[0.14em] text-slate-500">Total</p>
          <p class="mt-2 text-2xl font-semibold">{{ total }}</p>
        </UCard>
        <UCard>
          <p class="text-xs uppercase tracking-[0.14em] text-slate-500">
            Needs Review
          </p>
          <p class="mt-2 text-2xl font-semibold text-amber-600">
            {{ needsReview }}
          </p>
        </UCard>
        <UCard>
          <p class="text-xs uppercase tracking-[0.14em] text-slate-500">
            In Fulfillment
          </p>
          <p class="mt-2 text-2xl font-semibold text-sky-600">
            {{ activeDeliveryOrders }}
          </p>
        </UCard>
        <UCard>
          <p class="text-xs uppercase tracking-[0.14em] text-slate-500">
            Completed
          </p>
          <p class="mt-2 text-2xl font-semibold text-emerald-600">
            {{ completed }}
          </p>
        </UCard>
      </div>
    </div>
  </section>
</template>
