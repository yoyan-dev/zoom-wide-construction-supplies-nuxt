<script setup lang="ts">
import { storeToRefs } from "pinia";
import type { Delivery, DeliveryStatus } from "~/types/delivery";
import { useModal } from "~/composables/admin/useModal";
import ActionConfirmModal from "../../../_components/modals/ActionConfirmModal.vue";

definePageMeta({
  layout: "admin",
});

const route = useRoute();
const router = useRouter();
const deliveryId = computed(() => String(route.params.id));

const deliveryStore = useDeliveryStore();
const { openModal } = useModal();

await deliveryStore.fetchDeliveryById(deliveryId.value);

const { delivery } = storeToRefs(deliveryStore);

const statusOptions: Array<{ label: string; value: DeliveryStatus }> = [
  { label: "Scheduled", value: "scheduled" },
  { label: "In Transit", value: "in_transit" },
  { label: "Delivered", value: "delivered" },
  { label: "Failed", value: "failed" },
  { label: "Cancelled", value: "cancelled" },
];

const draft = reactive({
  status: "scheduled" as DeliveryStatus,
  driver_id: "",
  vehicle_number: "",
  scheduled_at: "",
  delivered_at: "",
});

watch(
  () => delivery.value,
  (value) => {
    draft.status = value?.status ?? "scheduled";
    draft.driver_id = value?.driver_id ?? "";
    draft.vehicle_number = value?.vehicle_number ?? "";
    draft.scheduled_at = value?.scheduled_at ?? "";
    draft.delivered_at = value?.delivered_at ?? "";
  },
  { immediate: true },
);

const handleSave = async () => {
  if (!delivery.value?.id) return;
  await deliveryStore.updateDelivery(delivery.value.id, {
    status: draft.status,
    driver_id: draft.driver_id || null,
    vehicle_number: draft.vehicle_number || null,
    scheduled_at: draft.scheduled_at || null,
    delivered_at: draft.delivered_at || null,
  } as Partial<Delivery>);
  router.push("/admin/deliveries");
};

const handleDelete = () => {
  if (!delivery.value?.id) return;
  openModal(ActionConfirmModal, {
    title: "Delete delivery",
    description: `Delete ${delivery.value.id}? This cannot be undone.`,
    confirmLabel: "Delete",
    confirmColor: "error",
    onConfirm: async () => {
      await deliveryStore.deleteDelivery(delivery.value!.id);
      router.push("/admin/deliveries");
    },
  });
};
</script>

<template>
  <div class="min-h-screen">
    <div class="space-y-6">
      <section class="bg-white p-2">
        <div
          class="flex flex-col gap-4 md:flex-row md:items-center md:justify-between"
        >
          <div>
            <p class="text-xs uppercase tracking-[0.18em] text-slate-500">
              Delivery Operations
            </p>
            <h1 class="mt-2 text-2xl font-semibold">Edit Delivery</h1>
            <p class="mt-2 text-sm text-slate-600">
              Update status, driver assignments, and scheduling.
            </p>
          </div>
          <div class="flex flex-wrap items-center gap-2">
            <UButton color="neutral" variant="outline" to="/admin/deliveries">
              Back to Deliveries
            </UButton>
            <UButton color="error" variant="outline" @click="handleDelete">
              Delete Delivery
            </UButton>
          </div>
        </div>
      </section>

      <UCard v-if="delivery">
        <div class="grid gap-6 md:grid-cols-2">
          <UFormField label="Status">
            <USelect
              class="w-full"
              valueKey="value"
              labelKey="label"
              v-model="draft.status"
              :items="statusOptions"
            />
          </UFormField>
          <UFormField label="Driver ID">
            <UInput class="w-full" v-model="draft.driver_id" />
          </UFormField>
          <UFormField label="Vehicle number">
            <UInput class="w-full" v-model="draft.vehicle_number" />
          </UFormField>
          <UFormField label="Scheduled at">
            <UInput
              class="w-full"
              v-model="draft.scheduled_at"
              type="datetime-local"
            />
          </UFormField>
          <UFormField label="Delivered at">
            <UInput
              class="w-full"
              v-model="draft.delivered_at"
              type="datetime-local"
            />
          </UFormField>
        </div>

        <div class="mt-6 flex justify-end gap-2">
          <UButton color="neutral" variant="ghost" to="/admin/deliveries">
            Cancel
          </UButton>
          <UButton color="primary" @click="handleSave">Save Changes</UButton>
        </div>
      </UCard>

      <UCard v-else>
        <p class="text-sm text-slate-600">
          Delivery not found. Check the URL or return to the deliveries list.
        </p>
      </UCard>
    </div>
  </div>
</template>
