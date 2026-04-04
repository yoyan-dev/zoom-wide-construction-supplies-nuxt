<script setup lang="ts">
import type {
  CreatePaymentPayload,
  Payment,
  PaymentMethod,
  PaymentStatus,
  UpdatePaymentPayload,
} from "~/types/payment";
import type { Order } from "~/types/order";
import { formatCurrency } from "~/utils/format";

type PaymentFormMode = "create" | "edit";
type PaymentSubmitValue = CreatePaymentPayload | UpdatePaymentPayload;

const props = defineProps<{
  mode: PaymentFormMode;
  payment?: Payment | null;
  orders: Order[];
  submitLabel: string;
  cancelLabel?: string;
  isSubmitting?: boolean;
}>();

const emit = defineEmits<{
  (e: "submit", value: PaymentSubmitValue): void;
  (e: "cancel"): void;
}>();

const draft = reactive({
  order_id: "",
  amount: 0,
  method: "cash" as PaymentMethod,
  status: "pending" as PaymentStatus,
  transaction_ref: "",
  paid_at: "",
});

const toDateTimeLocal = (value?: string | null) => {
  if (!value) {
    return "";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  const day = `${date.getDate()}`.padStart(2, "0");
  const hours = `${date.getHours()}`.padStart(2, "0");
  const minutes = `${date.getMinutes()}`.padStart(2, "0");

  return `${year}-${month}-${day}T${hours}:${minutes}`;
};

const normalizeDateValue = (value: string) => {
  const trimmed = value.trim();

  if (!trimmed) {
    return null;
  }

  const date = new Date(trimmed);
  return Number.isNaN(date.getTime()) ? null : date.toISOString();
};

watch(
  () => [props.mode, props.payment],
  () => {
    draft.order_id = props.payment?.order_id ?? "";
    draft.amount = props.payment?.amount ?? 0;
    draft.method = props.payment?.method ?? "cash";
    draft.status = props.payment?.status ?? "pending";
    draft.transaction_ref = props.payment?.transaction_ref ?? "";
    draft.paid_at = toDateTimeLocal(props.payment?.paid_at);
  },
  { immediate: true },
);

const orderOptions = computed(() =>
  props.orders.map((order) => ({
    label: `Order ${order.id} - ${formatCurrency(order.total_amount ?? 0)}`,
    value: order.id,
  })),
);

const methodOptions = [
  { label: "Cash", value: "cash" },
  { label: "Card", value: "card" },
  { label: "Bank Transfer", value: "bank_transfer" },
  { label: "Mobile Wallet", value: "mobile_wallet" },
];

const statusOptions = [
  { label: "Pending", value: "pending" },
  { label: "Paid", value: "paid" },
  { label: "Failed", value: "failed" },
  { label: "Refunded", value: "refunded" },
];

const isSubmitDisabled = computed(() => {
  if (props.mode === "edit") {
    return false;
  }

  return !draft.order_id.trim() || draft.amount <= 0;
});

const handleSubmit = () => {
  if (isSubmitDisabled.value) {
    return;
  }

  const sharedPayload = {
    status: draft.status,
    transaction_ref: draft.transaction_ref.trim() || null,
    paid_at: normalizeDateValue(draft.paid_at),
  };

  if (props.mode === "create") {
    emit("submit", {
      order_id: draft.order_id.trim(),
      amount: draft.amount,
      method: draft.method,
      ...sharedPayload,
    } satisfies CreatePaymentPayload);
    return;
  }

  emit("submit", sharedPayload satisfies UpdatePaymentPayload);
};
</script>

<template>
  <UForm @submit.prevent="handleSubmit">
    <div class="space-y-4">
      <div v-if="props.mode === 'create'" class="grid gap-4 md:grid-cols-2">
        <UFormField label="Order">
          <USelect
            class="w-full"
            v-model="draft.order_id"
            :items="orderOptions"
            placeholder="Select order"
          />
        </UFormField>

        <UFormField label="Amount">
          <UInputNumber
            v-model="draft.amount"
            class="w-full"
            :min="0"
            :step="1"
            placeholder="Enter payment amount"
          />
        </UFormField>
      </div>

      <div class="grid gap-4 md:grid-cols-2">
        <UFormField v-if="props.mode === 'create'" label="Method">
          <USelect
            class="w-full"
            v-model="draft.method"
            :items="methodOptions"
            placeholder="Select method"
          />
        </UFormField>

        <UFormField label="Status">
          <USelect
            class="w-full"
            v-model="draft.status"
            :items="statusOptions"
            placeholder="Select status"
          />
        </UFormField>
      </div>

      <div class="grid gap-4 md:grid-cols-2">
        <UFormField label="Transaction reference">
          <UInput
            v-model="draft.transaction_ref"
            class="w-full"
            placeholder="Enter transaction reference"
          />
        </UFormField>

        <UFormField label="Paid date and time">
          <UInput
            v-model="draft.paid_at"
            class="w-full"
            type="datetime-local"
          />
        </UFormField>
      </div>
    </div>

    <div class="mt-6 flex items-center justify-end gap-2">
      <UButton
        color="neutral"
        variant="ghost"
        type="button"
        @click="emit('cancel')"
      >
        {{ props.cancelLabel ?? "Cancel" }}
      </UButton>
      <UButton
        color="primary"
        type="submit"
        :disabled="isSubmitDisabled"
        :loading="props.isSubmitting"
      >
        {{ props.submitLabel }}
      </UButton>
    </div>
  </UForm>
</template>
