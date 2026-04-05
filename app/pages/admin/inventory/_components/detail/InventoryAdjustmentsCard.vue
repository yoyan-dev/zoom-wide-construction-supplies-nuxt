<script setup lang="ts">
import type { CreateInventoryMovementPayload } from "~/types/inventory";
import type { Product } from "~/types/product";
import { formatNumber } from "~/utils/format";

const props = defineProps<{
  product: Product;
  currentStock: number;
  isSaving: boolean;
  saveVersion: number;
}>();

const emit = defineEmits<{
  (e: "submit", payload: CreateInventoryMovementPayload): void;
}>();

const draft = reactive({
  quantity_change: 0,
  note: "",
});

watch(
  () => props.product.id,
  () => {
    draft.quantity_change = 0;
    draft.note = "";
  },
);

watch(
  () => props.saveVersion,
  () => {
    draft.quantity_change = 0;
    draft.note = "";
  },
);

const projectedStock = computed(
  () => props.currentStock + (draft.quantity_change || 0),
);

const isSubmitDisabled = computed(
  () => props.isSaving || !props.product.id || !draft.quantity_change,
);

const handleSubmit = () => {
  if (!props.product.id || !draft.quantity_change) {
    return;
  }

  emit("submit", {
    product_id: props.product.id,
    movement_type: "adjustment",
    quantity_change: draft.quantity_change,
    note: draft.note.trim() || null,
  });
};
</script>

<template>
  <UCard>
    <div class="space-y-5">
      <div>
        <p class="text-xs uppercase tracking-[0.18em] text-slate-500">
          Stock Adjustment
        </p>
        <h2 class="mt-2 text-xl font-semibold text-slate-900">
          Adjustment entry
        </h2>
        <p class="mt-2 text-sm text-slate-600">
          Record a simple stock increase or decrease for this product. Use a positive number to add stock and a negative number to reduce it.
        </p>
      </div>

      <div class="grid gap-3 sm:grid-cols-2">
        <div class="rounded-lg border border-slate-200/70 p-3">
          <p class="text-xs uppercase tracking-[0.18em] text-slate-500">
            Current stock
          </p>
          <p class="mt-2 text-lg font-semibold text-slate-900">
            {{ formatNumber(props.currentStock) }}
            {{ props.product.unit ?? "" }}
          </p>
        </div>

        <div class="rounded-lg border border-slate-200/70 p-3">
          <p class="text-xs uppercase tracking-[0.18em] text-slate-500">
            Projected stock
          </p>
          <p class="mt-2 text-lg font-semibold text-slate-900">
            {{ formatNumber(projectedStock) }}
            {{ props.product.unit ?? "" }}
          </p>
        </div>
      </div>

      <div class="grid gap-4">
        <UFormField
          label="Quantity change"
          description="Positive values add stock. Negative values reduce stock."
        >
          <UInputNumber
            v-model="draft.quantity_change"
            class="w-full"
            :step="1"
            placeholder="Enter adjustment quantity"
          />
        </UFormField>

        <UFormField
          label="Reason / note"
          description="Optional internal note for the adjustment record."
        >
          <UTextarea
            v-model="draft.note"
            class="w-full"
            placeholder="Add a note about the stock adjustment..."
          />
        </UFormField>
      </div>

      <div class="flex justify-end">
        <UButton
          color="primary"
          icon="i-lucide-save"
          :loading="props.isSaving"
          :disabled="isSubmitDisabled"
          @click="handleSubmit"
        >
          Save Stock Adjustment
        </UButton>
      </div>
    </div>
  </UCard>
</template>
