<script setup lang="ts">
import DeliveryForm from "../DeliveryForm.vue";
import type { CreateDeliveryPayload } from "~/types/delivery";
import type { Driver } from "~/types/driver";
import type { Order } from "~/types/order";
import { useAdminResponseToast } from "~/composables/admin/useAdminResponseToast";

type DeliveryCreateModalPayload = {
  orders: Order[];
  drivers: Driver[];
};

const props = defineProps<{
  payload: DeliveryCreateModalPayload | null;
}>();

const emit = defineEmits<{ close: [boolean] }>();

const deliveryStore = useDeliveryStore();
const { notifyResponse } = useAdminResponseToast();
const isSaving = ref(false);

const handleSave = async (payload: CreateDeliveryPayload) => {
  isSaving.value = true;
  const response = await deliveryStore.createDelivery(payload);
  isSaving.value = false;

  if (
    !notifyResponse(response, {
      successTitle: "Delivery created",
      successDescription: `Delivery for order ${payload.order_id} is ready.`,
      errorTitle: "Delivery not created",
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
          New Delivery
        </p>
        <h3 class="mt-2 text-lg font-semibold">Create delivery record</h3>
      </div>
    </template>
    <template #body>
      <DeliveryForm
        mode="create"
        :orders="props.payload?.orders ?? []"
        :drivers="props.payload?.drivers ?? []"
        submit-label="Create Delivery"
        :is-submitting="isSaving"
        @submit="handleSave"
        @cancel="emit('close', false)"
      />
    </template>
  </UModal>
</template>
