<script setup lang="ts">
import PaymentForm from "../PaymentForm.vue";
import type { CreatePaymentPayload } from "~/types/payment";
import type { Order } from "~/types/order";
import { useAdminResponseToast } from "~/composables/admin/useAdminResponseToast";

type PaymentCreateModalPayload = {
  orders: Order[];
};

const props = defineProps<{
  payload: PaymentCreateModalPayload | null;
}>();

const emit = defineEmits<{ close: [boolean] }>();

const paymentStore = usePaymentStore();
const { notifyResponse } = useAdminResponseToast();
const isSaving = ref(false);

const handleSave = async (payload: CreatePaymentPayload) => {
  isSaving.value = true;
  const response = await paymentStore.createPayment(payload);
  isSaving.value = false;

  if (
    !notifyResponse(response, {
      successTitle: "Payment created",
      successDescription: `Payment for order ${payload.order_id} was recorded.`,
      errorTitle: "Payment not created",
    })
  ) {
    return;
  }

  emit("close", false);
};
</script>

<template>
  <UModal :close="{ onClick: () => emit('close', false) }">
    <template #header>
      <div>
        <p class="text-xs uppercase tracking-[0.18em] text-slate-500">
          New Payment
        </p>
        <h3 class="mt-2 text-lg font-semibold">Record payment</h3>
      </div>
    </template>
    <template #body>
      <PaymentForm
        mode="create"
        :orders="props.payload?.orders ?? []"
        submit-label="Create Payment"
        :is-submitting="isSaving"
        @submit="handleSave"
        @cancel="emit('close', false)"
      />
    </template>
  </UModal>
</template>
