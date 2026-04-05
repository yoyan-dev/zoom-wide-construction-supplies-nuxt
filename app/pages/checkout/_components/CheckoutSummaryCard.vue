<script setup lang="ts">
import { formatCurrency } from "~/utils/format";

const props = defineProps<{
  itemCount: number;
  subtotal: number;
  freightAmount: number;
  taxAmount: number;
  totalAmount: number;
  freightZoneLabel: string;
  addressSummary: string | null;
  deliveryNotes: string;
  canSubmit: boolean;
  isSubmitting?: boolean;
}>();

defineEmits<{
  (e: "submit"): void;
}>();
</script>

<template>
  <StorefrontSectionCard class="sticky top-28 bg-slate-50" padding="lg">
    <div class="space-y-8">
      <div>
        <p class="text-[0.72rem] font-semibold uppercase tracking-[0.22em] text-amber-700">
          Order logistics
        </p>
        <h2 class="mt-3 text-3xl font-bold tracking-[-0.04em] text-slate-950">
          Review totals and submit the order.
        </h2>
      </div>

      <div class="space-y-4 border-b border-slate-200 pb-6">
        <div class="flex items-center justify-between gap-4">
          <span class="text-sm font-medium uppercase tracking-[0.16em] text-slate-500">
            Merchandise subtotal
          </span>
          <span class="text-lg font-bold text-slate-950">
            {{ formatCurrency(props.subtotal) }}
          </span>
        </div>
        <div class="flex items-center justify-between gap-4">
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
        </div>
      </div>

      <div class="rounded-xl border border-slate-200 bg-white p-5">
        <p class="text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-slate-500">
          Project total
        </p>
        <p class="mt-2 text-4xl font-black tracking-[-0.05em] text-slate-950">
          {{ formatCurrency(props.totalAmount) }}
        </p>
        <p class="mt-2 text-sm leading-7 text-slate-500">
          {{ props.itemCount }} units will be included in the submitted order.
        </p>
      </div>

      <div class="space-y-4 rounded-xl border border-slate-200 bg-white p-5">
        <div>
          <p class="text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-slate-500">
            Freight zone
          </p>
          <p class="mt-1 text-sm font-semibold text-slate-950">
            {{ props.freightZoneLabel }}
          </p>
        </div>

        <div>
          <p class="text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-slate-500">
            Delivery address
          </p>
          <p class="mt-1 text-sm leading-7 text-slate-600">
            {{
              props.addressSummary ||
              "Select an existing delivery address or save a new one before submitting."
            }}
          </p>
        </div>

        <div v-if="props.deliveryNotes.trim()">
          <p class="text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-slate-500">
            Delivery instructions
          </p>
          <p class="mt-1 text-sm leading-7 text-slate-600">
            {{ props.deliveryNotes.trim() }}
          </p>
        </div>
      </div>

      <div class="space-y-3">
        <StorefrontButton
          tone="primary"
          size="xl"
          block
          :loading="props.isSubmitting"
          :disabled="!props.canSubmit"
          @click="$emit('submit')"
        >
          Place order
        </StorefrontButton>

        <StorefrontButton tone="secondary" size="lg" block to="/cart">
          Back to cart
        </StorefrontButton>
      </div>

      <div class="rounded-xl border border-slate-200 bg-white p-4">
        <div class="flex items-start gap-3">
          <div class="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-50 text-amber-700">
            <UIcon name="i-lucide-shield-check" class="text-lg" />
          </div>
          <p class="text-sm leading-7 text-slate-600">
            Orders placed here use the live cart checkout flow already present in
            the project, so this page stays compatible with your existing API.
          </p>
        </div>
      </div>
    </div>
  </StorefrontSectionCard>
</template>
