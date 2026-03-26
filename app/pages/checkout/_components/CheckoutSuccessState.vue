<script setup lang="ts">
import type { Order } from "~/types/order";
import { formatCurrency, formatLongDate } from "~/utils/format";

defineProps<{
  order: Order;
}>();
</script>

<template>
  <section class="rounded-[32px] border border-emerald-200/70 bg-white p-6 shadow-sm md:p-8">
    <div class="mx-auto max-w-3xl text-center">
      <div
        class="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-50 text-emerald-600"
      >
        <UIcon name="i-lucide-circle-check" class="h-6 w-6" />
      </div>

      <p class="mt-5 text-xs uppercase tracking-[0.22em] text-emerald-700">
        Order Submitted
      </p>
      <h2 class="mt-3 text-3xl font-semibold tracking-tight text-slate-900">
        Your order request has been created
      </h2>
      <p class="mt-3 text-sm leading-7 text-slate-600">
        The cart has been cleared after a successful submission. Order history
        and tracking views can now build on this flow in the next Phase 4 steps.
      </p>

      <div class="mt-8 grid gap-4 rounded-[28px] border border-slate-200/70 bg-slate-50/60 p-5 md:grid-cols-3">
        <div>
          <p class="text-xs uppercase tracking-[0.18em] text-slate-500">
            Order ID
          </p>
          <p class="mt-2 font-semibold text-slate-900">
            {{ order.id }}
          </p>
        </div>
        <div>
          <p class="text-xs uppercase tracking-[0.18em] text-slate-500">
            Status
          </p>
          <p class="mt-2 font-semibold capitalize text-slate-900">
            {{ order.status }}
          </p>
        </div>
        <div>
          <p class="text-xs uppercase tracking-[0.18em] text-slate-500">
            Total
          </p>
          <p class="mt-2 font-semibold text-slate-900">
            {{ formatCurrency(order.total_amount) }}
          </p>
        </div>
      </div>

      <p class="mt-4 text-sm text-slate-500">
        Submitted {{ formatLongDate(order.created_at) }}
      </p>

      <div class="mt-6 flex flex-wrap justify-center gap-3">
        <UButton color="primary" to="/shop">
          Continue Shopping
        </UButton>
        <UButton color="neutral" variant="outline" to="/orders">
          View My Orders
        </UButton>
      </div>
    </div>
  </section>
</template>
