<script setup lang="ts">
import type { CartLineItem } from "~/types/cart";
import { formatCurrency } from "~/utils/format";

defineProps<{
  items: CartLineItem[];
  distinctItemCount: number;
  itemCount: number;
  subtotal: number;
  canReviewOrder: boolean;
  isSubmitting?: boolean;
}>();

const emit = defineEmits<{
  (e: "submit"): void;
}>();
</script>

<template>
  <section class="xl:sticky xl:top-24">
    <UCard class="rounded-xl bg-white/95 shadow-sm">
      <div class="space-y-6">
        <div>
          <p class="text-xs uppercase tracking-[0.16em] text-slate-500">
            Order Summary
          </p>
          <h2 class="mt-2 text-xl font-semibold text-slate-900">
            Checkout Cart Review
          </h2>
        </div>

        <div class="space-y-4">
          <div
            v-for="item in items"
            :key="item.product_id"
            class="flex items-start justify-between gap-4 border-b border-slate-100 pb-4 last:border-b-0 last:pb-0"
          >
            <div class="min-w-0">
              <p class="font-medium text-slate-900">
                {{ item.name }}
              </p>
              <p class="mt-1 text-sm text-slate-600">
                {{ item.quantity }} x {{ formatCurrency(item.price) }} per
                {{ item.unit }}
              </p>
            </div>

            <p class="shrink-0 font-medium text-slate-900">
              {{ formatCurrency(item.price * item.quantity) }}
            </p>
          </div>
        </div>

        <div class="space-y-3 text-sm text-slate-600">
          <div class="flex items-center justify-between gap-4">
            <span>Distinct items</span>
            <span class="font-medium text-slate-900">{{ distinctItemCount }}</span>
          </div>
          <div class="flex items-center justify-between gap-4">
            <span>Total quantity</span>
            <span class="font-medium text-slate-900">{{ itemCount }}</span>
          </div>
          <div class="flex items-center justify-between gap-4">
            <span>Subtotal</span>
            <span class="text-lg font-semibold text-slate-900">
              {{ formatCurrency(subtotal) }}
            </span>
          </div>
        </div>

        <div class="grid gap-2">
          <div class="flex items-center gap-2 rounded-lg bg-slate-50/80 px-3 py-2 text-sm text-slate-700">
            <UIcon name="i-lucide-shield-check" class="text-emerald-600" />
            Secure order submission workflow
          </div>
          <div class="flex items-center gap-2 rounded-lg bg-slate-50/80 px-3 py-2 text-sm text-slate-700">
            <UIcon name="i-lucide-lock" class="text-sky-600" />
            Buyer and delivery details are protected
          </div>
        </div>

        <div
          class="rounded-lg p-4 text-sm leading-6"
          :class="
            canReviewOrder
              ? 'bg-emerald-50 text-emerald-700'
              : 'bg-amber-50 text-amber-700'
          "
        >
          <span v-if="canReviewOrder">
            Checkout details are complete enough for the upcoming order phase.
          </span>
          <span v-else>
            Complete the required delivery fields before the checkout flow can
            move into order submission.
          </span>
        </div>

        <div class="flex flex-col gap-3">
          <UButton
            color="warning"
            class="rounded-lg font-semibold shadow-sm w-full justify-center"
            :disabled="!canReviewOrder"
            :loading="isSubmitting"
            @click="emit('submit')"
          >
            Submit Order Request
          </UButton>
          <UButton
            color="neutral"
            variant="outline"
            class="rounded-lg font-semibold w-full justify-center"
            to="/cart"
          >
            Edit Cart
          </UButton>
        </div>
      </div>
    </UCard>
  </section>
</template>
