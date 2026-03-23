<script setup lang="ts">
defineProps<{
  total: number;
  scheduled: number;
  inTransit: number;
  attention: number;
}>();
</script>

<template>
  <section
    class="rounded-3xl border border-slate-200/70 bg-[radial-gradient(circle_at_top,_#eef2ff,_#f8fafc_42%,_#ecfeff_100%)] p-6 shadow-sm md:p-8"
  >
    <div class="flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
      <div class="space-y-3">
        <p class="text-xs uppercase tracking-[0.18em] text-slate-500">
          Staff Deliveries Workspace
        </p>
        <div>
          <h1 class="text-2xl font-semibold md:text-3xl">
            Dispatch and route follow-up
          </h1>
          <p class="mt-2 max-w-3xl text-sm text-slate-600 md:text-base">
            Track driver assignments, route schedules, and site delivery progress
            from one operational dispatch board.
          </p>
        </div>
        <div class="flex flex-wrap gap-3">
          <UButton icon="i-lucide-truck" color="neutral" variant="outline">
            Review assignments
          </UButton>
          <UButton icon="i-lucide-shopping-cart" to="/staff/orders">
            Open order queue
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
            Scheduled
          </p>
          <p class="mt-2 text-2xl font-semibold text-amber-600">
            {{ scheduled }}
          </p>
        </UCard>
        <UCard>
          <p class="text-xs uppercase tracking-[0.14em] text-slate-500">
            In Transit
          </p>
          <p class="mt-2 text-2xl font-semibold text-sky-600">
            {{ inTransit }}
          </p>
        </UCard>
        <UCard>
          <p class="text-xs uppercase tracking-[0.14em] text-slate-500">
            Attention
          </p>
          <p class="mt-2 text-2xl font-semibold text-rose-600">
            {{ attention }}
          </p>
        </UCard>
      </div>
    </div>
  </section>
</template>
