<script setup lang="ts">
const props = defineProps<{
  distinctItemCount: number;
  itemCount: number;
}>();

const cartLabel = computed(() => {
  if (!props.distinctItemCount) {
    return "Your cart is ready when you are.";
  }

  return `${props.distinctItemCount} item${props.distinctItemCount === 1 ? "" : "s"} / ${props.itemCount} unit${props.itemCount === 1 ? "" : "s"}`;
});
</script>

<template>
  <section class="rounded-xl bg-white/95 shadow-sm p-6 md:p-8">
    <div class="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
      <div>
        <p class="text-xs font-medium uppercase tracking-[0.2em] text-amber-700">
          Buyer Cart
        </p>
        <h1 class="mt-3 text-3xl font-semibold tracking-tight text-slate-900 md:text-4xl">
          Review Your Cart
        </h1>
        <p class="mt-3 text-sm leading-7 text-slate-600">
          {{ cartLabel }}
        </p>
      </div>

      <div class="space-y-3">
        <div class="grid grid-cols-3 gap-2">
          <div class="rounded-lg bg-slate-50/80 p-3 text-center">
            <p class="text-xs uppercase tracking-[0.16em] text-slate-500">1</p>
            <p class="mt-1 text-sm font-semibold text-slate-800">Cart</p>
          </div>
          <div class="rounded-lg bg-slate-50/80 p-3 text-center">
            <p class="text-xs uppercase tracking-[0.16em] text-slate-500">2</p>
            <p class="mt-1 text-sm font-semibold text-slate-600">Checkout</p>
          </div>
          <div class="rounded-lg bg-slate-50/80 p-3 text-center">
            <p class="text-xs uppercase tracking-[0.16em] text-slate-500">3</p>
            <p class="mt-1 text-sm font-semibold text-slate-600">Submit</p>
          </div>
        </div>

        <div class="flex flex-wrap items-center justify-end gap-3">
          <UButton color="neutral" variant="outline" class="rounded-lg font-semibold" to="/shop">
            Continue Shopping
          </UButton>
          <UButton color="warning" class="rounded-lg font-semibold shadow-sm" :disabled="!props.distinctItemCount" to="/checkout">
            Proceed to Checkout
          </UButton>
        </div>
      </div>
    </div>
  </section>
</template>
