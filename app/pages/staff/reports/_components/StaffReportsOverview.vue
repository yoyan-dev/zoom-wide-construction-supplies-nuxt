<script setup lang="ts">
defineProps<{
  totalOrders: number;
  activeDeliveries: number;
  lowStock: number;
  customers: number;
}>();
</script>

<template>
  <section
    class="rounded-3xl border border-slate-200/70 bg-[radial-gradient(circle_at_top,_#fef3c7,_#f8fafc_42%,_#eef2ff_100%)] p-6 shadow-sm md:p-8"
  >
    <div class="flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
      <div class="space-y-3">
        <p class="text-xs uppercase tracking-[0.18em] text-slate-500">
          Staff Reports Workspace
        </p>
        <div>
          <h1 class="text-2xl font-semibold md:text-3xl">
            Daily operational reporting
          </h1>
          <p class="mt-2 max-w-3xl text-sm text-slate-600 md:text-base">
            Review a practical summary of order flow, dispatch activity, stock
            pressure, and customer coverage for day-to-day staff coordination.
          </p>
        </div>
        <div class="flex flex-wrap gap-3">
          <UButton icon="i-lucide-file-text" color="neutral" variant="outline">
            Review summary
          </UButton>
          <UButton icon="i-lucide-layout-dashboard" to="/staff">
            Back to dashboard
          </UButton>
        </div>
      </div>

      <div class="grid gap-3 sm:grid-cols-2 xl:min-w-[460px] xl:grid-cols-4">
        <UCard>
          <p class="text-xs uppercase tracking-[0.14em] text-slate-500">Orders</p>
          <p class="mt-2 text-2xl font-semibold">{{ totalOrders }}</p>
        </UCard>
        <UCard>
          <p class="text-xs uppercase tracking-[0.14em] text-slate-500">
            Active Deliveries
          </p>
          <p class="mt-2 text-2xl font-semibold text-sky-600">
            {{ activeDeliveries }}
          </p>
        </UCard>
        <UCard>
          <p class="text-xs uppercase tracking-[0.14em] text-slate-500">
            Low Stock
          </p>
          <p class="mt-2 text-2xl font-semibold text-amber-600">
            {{ lowStock }}
          </p>
        </UCard>
        <UCard>
          <p class="text-xs uppercase tracking-[0.14em] text-slate-500">
            Customers
          </p>
          <p class="mt-2 text-2xl font-semibold text-emerald-600">
            {{ customers }}
          </p>
        </UCard>
      </div>
    </div>
  </section>
</template>
