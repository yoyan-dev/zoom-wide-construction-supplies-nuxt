<script setup lang="ts">
defineProps<{
  total: number;
  withOpenOrders: number;
  pendingFollowUps: number;
  recentAccounts: number;
}>();
</script>

<template>
  <section
    class="rounded-3xl border border-slate-200/70 bg-[radial-gradient(circle_at_top,_#eff6ff,_#f8fafc_42%,_#f0fdf4_100%)] p-6 shadow-sm md:p-8"
  >
    <div class="flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
      <div class="space-y-3">
        <p class="text-xs uppercase tracking-[0.18em] text-slate-500">
          Staff Customers Workspace
        </p>
        <div>
          <h1 class="text-2xl font-semibold md:text-3xl">
            Customer assistance and follow-up
          </h1>
          <p class="mt-2 max-w-3xl text-sm text-slate-600 md:text-base">
            Help staff track customer accounts, open order contexts, and the
            companies that need outreach or clarification.
          </p>
        </div>
        <div class="flex flex-wrap gap-3">
          <UButton icon="i-lucide-phone-call" color="neutral" variant="outline">
            Review follow-ups
          </UButton>
          <UButton icon="i-lucide-shopping-cart" to="/staff/orders">
            Open orders
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
            Open Orders
          </p>
          <p class="mt-2 text-2xl font-semibold text-sky-600">
            {{ withOpenOrders }}
          </p>
        </UCard>
        <UCard>
          <p class="text-xs uppercase tracking-[0.14em] text-slate-500">
            Follow-ups
          </p>
          <p class="mt-2 text-2xl font-semibold text-amber-600">
            {{ pendingFollowUps }}
          </p>
        </UCard>
        <UCard>
          <p class="text-xs uppercase tracking-[0.14em] text-slate-500">
            Recent Accounts
          </p>
          <p class="mt-2 text-2xl font-semibold text-emerald-600">
            {{ recentAccounts }}
          </p>
        </UCard>
      </div>
    </div>
  </section>
</template>
