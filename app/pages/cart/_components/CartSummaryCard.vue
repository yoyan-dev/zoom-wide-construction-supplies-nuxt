<script setup lang="ts">
import { formatCurrency } from "~/utils/format";

const props = defineProps<{
  subtotal: number;
  freightAmount: number;
  taxAmount: number;
  totalAmount: number;
  itemCount: number;
  notes: string;
  hasItems: boolean;
  isBusy?: boolean;
  isAuthenticated?: boolean;
}>();

const cartStore = useCartStore();
</script>

<template>
  <StorefrontSectionCard class="sticky top-28 bg-slate-50" padding="lg">
    <div class="space-y-8">
      <div>
        <p
          class="text-[0.72rem] font-semibold uppercase tracking-[0.22em] text-amber-700"
        >
          Order logistics
        </p>
        <h2 class="mt-3 text-3xl font-bold tracking-[-0.04em] text-slate-950">
          Review totals and next actions.
        </h2>
      </div>

      <!-- <div class="space-y-4 border-b border-slate-200 pb-6"> -->
      <!-- <div class="flex items-center justify-between gap-4">
          <span class="text-sm font-medium uppercase tracking-[0.16em] text-slate-500">
            Subtotal
          </span>
          <span class="text-lg font-bold text-slate-950">
            {{ formatCurrency(props.subtotal) }}
          </span>
        </div> -->
      <!-- <div class="flex items-center justify-between gap-4">
          <span class="text-sm font-medium uppercase tracking-[0.16em] text-slate-500">
            Freight estimate
          </span>
          <span class="text-lg font-bold text-slate-950">
            {{ formatCurrency(props.freightAmount) }}
          </span>
        </div>
        <div class="flex items-center justify-between gap-4">
          <span class="text-sm font-medium uppercase tracking-[0.16em] text-slate-500">
            Tax estimate
          </span>
          <span class="text-lg font-bold text-slate-950">
            {{ formatCurrency(props.taxAmount) }}
          </span>
        </div> -->
      <!-- </div> -->

      <div class="rounded-lg border border-slate-200 bg-white p-5">
        <StorefrontPriceDisplay
          eyebrow="Project total"
          :amount="props.subtotal"
          size="lg"
        />
        <p class="mt-2 text-sm leading-7 text-slate-500">
          {{ props.itemCount }} total units across the current project load.
        </p>
      </div>

      <div class="space-y-3">
        <StorefrontButton
          tone="primary"
          size="xl"
          block
          :to="
            props.isAuthenticated
              ? '/checkout'
              : '/auth/login?redirect=/checkout'
          "
          :disabled="!props.hasItems || props.isBusy"
        >
          {{
            props.isAuthenticated
              ? "Proceed to checkout"
              : "Sign in to checkout"
          }}
        </StorefrontButton>

        <StorefrontButton
          tone="secondary"
          size="lg"
          block
          :disabled="!props.hasItems || props.isBusy"
          @click="cartStore.clearCart()"
        >
          Clear cart
        </StorefrontButton>
      </div>

      <div class="rounded-lg border border-slate-200 bg-white p-4">
        <div class="flex items-start gap-3">
          <div
            class="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-50 text-amber-700"
          >
            <UIcon name="i-lucide-shield-check" class="text-lg" />
          </div>
          <p class="text-sm leading-7 text-slate-600">
            {{ props.notes }}
          </p>
        </div>
      </div>

      <StorefrontTrustBadges compact />
    </div>
  </StorefrontSectionCard>
</template>
