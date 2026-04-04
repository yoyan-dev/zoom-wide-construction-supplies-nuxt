<template>
  <section
    class="rounded-sm border border-dashed border-slate-300 bg-white p-8 text-center shadow-sm"
  >
    <p class="text-xs uppercase tracking-[0.22em] text-slate-500">
      Order History
    </p>
    <h2 class="mt-3 text-2xl font-semibold tracking-tight text-slate-900">
      No orders yet
    </h2>
    <p class="mx-auto mt-3 max-w-2xl text-sm leading-7 text-slate-600">
      Once you submit an order, it will appear here for review and tracking.
    </p>

    <div class="mt-6 flex flex-wrap justify-center gap-3">
      <UButton color="primary" to="/shop"> Browse Products </UButton>
      <UButton color="neutral" variant="outline" to="/cart">
        View Cart
      </UButton>
    </div>
  </section>
</template>
