<script setup lang="ts">
defineProps<{
  total: number;
  lowStock: number;
  active: number;
  warehouses: number;
}>();
</script>

<template>
  <section
    class="rounded-3xl border border-slate-200/70 bg-[radial-gradient(circle_at_top,_#ecfeff,_#f8fafc_42%,_#eef2ff_100%)] p-6 shadow-sm md:p-8"
  >
    <div class="flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
      <div class="space-y-3">
        <p class="text-xs uppercase tracking-[0.18em] text-slate-500">
          Staff Products Workspace
        </p>
        <div>
          <h1 class="text-2xl font-semibold md:text-3xl">
            Product availability coordination
          </h1>
          <p class="mt-2 max-w-3xl text-sm text-slate-600 md:text-base">
            Keep the catalog accurate for staff operations by watching stock
            pressure, warehouse placement, and product activity.
          </p>
        </div>
        <div class="flex flex-wrap gap-3">
          <UButton icon="i-lucide-package" color="neutral" variant="outline">
            Review stock
          </UButton>
          <UButton icon="i-lucide-users" to="/staff/customers">
            Check customer inquiries
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
            Low Stock
          </p>
          <p class="mt-2 text-2xl font-semibold text-amber-600">
            {{ lowStock }}
          </p>
        </UCard>
        <UCard>
          <p class="text-xs uppercase tracking-[0.14em] text-slate-500">
            Active
          </p>
          <p class="mt-2 text-2xl font-semibold text-emerald-600">
            {{ active }}
          </p>
        </UCard>
        <UCard>
          <p class="text-xs uppercase tracking-[0.14em] text-slate-500">
            Warehouses
          </p>
          <p class="mt-2 text-2xl font-semibold text-sky-600">
            {{ warehouses }}
          </p>
        </UCard>
      </div>
    </div>
  </section>
</template>
