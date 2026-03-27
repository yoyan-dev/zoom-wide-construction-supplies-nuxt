<script setup lang="ts">
import DeliveryForm from "../DeliveryForm.vue";
import type { Delivery, UpdateDeliveryPayload } from "~/types/delivery";
import type { Driver } from "~/types/driver";
import { useAdminResponseToast } from "~/composables/admin/useAdminResponseToast";

type DeliveryEditModalPayload = {
  delivery: Delivery;
  drivers: Driver[];
};

const props = defineProps<{
  payload: DeliveryEditModalPayload | null;
}>();

const emit = defineEmits<{ close: [boolean] }>();

const deliveryStore = useDeliveryStore();
const { notifyResponse } = useAdminResponseToast();
const isSaving = ref(false);

const handleSave = async (payload: UpdateDeliveryPayload) => {
  const deliveryId = props.payload?.delivery.id;

  if (!deliveryId) {
    return;
  }

  isSaving.value = true;
  const response = await deliveryStore.updateDelivery(deliveryId, payload);
  isSaving.value = false;

  if (
    !notifyResponse(response, {
      successTitle: "Delivery updated",
      successDescription: `Saved updates for delivery ${deliveryId}.`,
      errorTitle: "Delivery not updated",
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
          Update Delivery
        </p>
        <h3 class="mt-2 text-lg font-semibold">
          {{
            props.payload?.delivery.id
              ? `Delivery ${props.payload.delivery.id}`
              : "Delivery"
          }}
        </h3>
      </div>
    </template>
    <template #body>
      <DeliveryForm
        mode="edit"
        :delivery="props.payload?.delivery"
        :orders="[]"
        :drivers="props.payload?.drivers ?? []"
        submit-label="Save Delivery Updates"
        :is-submitting="isSaving"
        @submit="handleSave"
        @cancel="emit('close', false)"
      />
    </template>
  </UModal>
</template>
