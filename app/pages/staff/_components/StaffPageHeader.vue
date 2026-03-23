<script setup lang="ts">
const todayLabel = new Intl.DateTimeFormat("en-US", {
  weekday: "long",
  month: "long",
  day: "numeric",
}).format(new Date());

const focusItems = [
  {
    title: "Review the queue early",
    detail: "Clear the 18 orders waiting for approval, clarification, or endorsement.",
    icon: "i-lucide-list-todo",
  },
  {
    title: "Stabilize delayed dispatch",
    detail: "Escalate the 2 flagged delivery routes before late morning cut-off.",
    icon: "i-lucide-truck",
  },
  {
    title: "Protect stock-sensitive items",
    detail: "Coordinate fast-moving cement, GI pipes, and roofing stock before noon.",
    icon: "i-lucide-package",
  },
];
</script>

<template>
  <section
    class="rounded-3xl border border-slate-200/70 bg-[radial-gradient(circle_at_top,_#eff6ff,_#f8fafc_42%,_#eef2ff_100%)] p-6 shadow-sm md:p-8"
  >
    <div class="grid gap-6 xl:grid-cols-[minmax(0,2fr)_minmax(320px,1fr)]">
      <div class="space-y-4">
        <p class="text-xs uppercase tracking-[0.2em] text-slate-500">
          Staff Operations Dashboard
        </p>

        <div>
          <h1 class="text-2xl font-semibold md:text-3xl">
            Keep daily fulfillment moving
          </h1>
          <p class="mt-2 max-w-3xl text-sm text-slate-600 md:text-base">
            Track the work that matters most for staff users: order monitoring,
            customer assistance, delivery coordination, product availability,
            and quick operational visibility.
          </p>
        </div>

        <div class="flex flex-wrap gap-3 text-xs text-slate-500">
          <span class="rounded-full bg-white/80 px-3 py-1 shadow-sm">
            {{ todayLabel }}
          </span>
          <span class="rounded-full bg-white/80 px-3 py-1 shadow-sm">
            Warehouse sync: 10 min ago
          </span>
          <span class="rounded-full bg-white/80 px-3 py-1 shadow-sm">
            Visible modules: Orders, Products, Customers, Deliveries, Reports
          </span>
        </div>

        <div class="flex flex-wrap gap-3">
          <UButton icon="i-lucide-shopping-cart" to="/staff/orders">
            Open order queue
          </UButton>
          <UButton
            color="neutral"
            variant="outline"
            icon="i-lucide-chart-column"
            to="/staff/reports"
          >
            View reports
          </UButton>
        </div>
      </div>

      <div class="rounded-2xl border border-white/80 bg-white/80 p-5 shadow-sm">
        <div class="flex items-center justify-between gap-3">
          <div>
            <p class="text-xs uppercase tracking-[0.18em] text-slate-500">
              Welcome Overview
            </p>
            <p class="mt-1 text-lg font-semibold">Today&apos;s focus</p>
          </div>
          <div
            class="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-100 text-slate-700"
          >
            <UIcon name="i-lucide-briefcase" class="h-5 w-5" />
          </div>
        </div>

        <div class="mt-4 space-y-4">
          <div
            v-for="item in focusItems"
            :key="item.title"
            class="flex gap-3 rounded-2xl border border-slate-200/70 bg-slate-50 p-3"
          >
            <div
              class="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-slate-700 shadow-sm"
            >
              <UIcon :name="item.icon" class="h-5 w-5" />
            </div>
            <div>
              <p class="text-sm font-semibold text-slate-900">
                {{ item.title }}
              </p>
              <p class="mt-1 text-sm text-slate-600">
                {{ item.detail }}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
