<template>
  <section class="rounded-sm bg-white p-6 shadow-sm dark:bg-gray-900 md:p-8">
    <div class="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
      <div>
        <p class="text-xs font-medium uppercase tracking-[0.2em] text-amber-700">
          Operations Dashboard
        </p>
        <h1 class="mt-3 text-3xl font-semibold tracking-tight text-slate-900 md:text-4xl">
          Zoom @ Wide performance overview
        </h1>
        <p class="mt-3 max-w-3xl text-sm leading-7 text-slate-600">
          Track active catalog items, incoming orders, delivery progress, and
          payment outcomes from one operational view.
        </p>
      </div>
      <div class="flex flex-wrap gap-2">
        <UButton
          color="neutral"
          variant="outline"
          class="rounded-lg font-semibold"
          to="/admin/orders"
        >
          View Orders
        </UButton>
        <UButton
          color="warning"
          class="rounded-lg font-semibold shadow-sm"
          to="/admin/products"
        >
          Manage Products
        </UButton>
      </div>
    </div>
  </section>
</template>
