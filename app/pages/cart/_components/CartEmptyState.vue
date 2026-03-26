<template>
  <section class="rounded-[28px] border border-dashed border-slate-300 bg-white p-8 text-center shadow-sm">
    <p class="text-xs uppercase tracking-[0.22em] text-slate-500">
      Cart Status
    </p>
    <h2 class="mt-3 text-2xl font-semibold tracking-tight text-slate-900">
      Your cart is empty
    </h2>
    <p class="mx-auto mt-3 max-w-2xl text-sm leading-7 text-slate-600">
      Browse the catalog and add the materials you need before continuing to
      checkout.
    </p>

    <div class="mt-6 flex flex-wrap justify-center gap-3">
      <UButton color="primary" to="/shop">
        Browse Products
      </UButton>
    </div>
  </section>
</template>
