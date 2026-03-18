<script setup lang="ts">
import { storeToRefs } from "pinia";
import type { Order, OrderStatus } from "~/types/order";
import { useModal } from "~/composables/admin/useModal";
import ActionConfirmModal from "../../../_components/modals/ActionConfirmModal.vue";

definePageMeta({
  layout: "admin",
});

const route = useRoute();
const router = useRouter();
const orderId = computed(() => String(route.params.id));

const orderStore = useOrderStore();
const deliveryStore = useDeliveryStore();
const { openModal } = useModal();

await orderStore.fetchOrderById(orderId.value);

const { order } = storeToRefs(orderStore);

const statusOptions: Array<{ label: string; value: OrderStatus }> = [
  { label: "Pending", value: "pending" },
  { label: "Approved", value: "approved" },
  { label: "Rejected", value: "rejected" },
  { label: "Cancelled", value: "cancelled" },
  { label: "Completed", value: "completed" },
];

const draft = reactive({
  status: "pending" as OrderStatus,
  total_amount: 0,
  notes: "",
  approved_by: "",
  rejection_reason: "",
});

watch(
  () => order.value,
  (value) => {
    draft.status = value?.status ?? "pending";
    draft.total_amount = value?.total_amount ?? 0;
    draft.notes = value?.notes ?? "";
    draft.approved_by = value?.approved_by ?? "";
    draft.rejection_reason = value?.rejection_reason ?? "";
  },
  { immediate: true },
);

const handleSave = async () => {
  if (!order.value?.id) return;
  const currentDelivery = deliveryStore.getDeliveryByOrderId(order.value.id);
  if (draft.status === "cancelled" && currentDelivery) {
    await deliveryStore.updateDeliveryStatus(currentDelivery.id, "cancelled");
  }
  await orderStore.updateOrder(order.value.id, {
    status: draft.status,
    total_amount: draft.total_amount,
    notes: draft.notes || null,
    approved_by: draft.approved_by || null,
    rejection_reason: draft.rejection_reason || null,
  } as Partial<Order>);
  router.push("/admin/orders");
};

const handleDelete = () => {
  if (!order.value?.id) return;
  openModal(ActionConfirmModal, {
    title: "Delete order",
    description: `Delete ${order.value.id}? This cannot be undone.`,
    confirmLabel: "Delete",
    confirmColor: "error",
    onConfirm: async () => {
      await orderStore.deleteOrder(order.value!.id);
      router.push("/admin/orders");
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
              Orders Management
            </p>
            <h1 class="mt-2 text-2xl font-semibold">Edit Order</h1>
            <p class="mt-2 text-sm text-slate-600">
              Update order status, totals, and notes.
            </p>
          </div>
          <div class="flex flex-wrap items-center gap-2">
            <UButton color="neutral" variant="outline" to="/admin/orders">
              Back to Orders
            </UButton>
            <UButton color="error" variant="outline" @click="handleDelete">
              Delete Order
            </UButton>
          </div>
        </div>
      </section>

      <UCard v-if="order">
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
          <UFormField label="Total amount">
            <UInput
              class="w-full"
              v-model.number="draft.total_amount"
              type="number"
            />
          </UFormField>
          <UFormField label="Approved by">
            <UInput class="w-full" v-model="draft.approved_by" />
          </UFormField>
          <UFormField label="Rejection reason">
            <UInput class="w-full" v-model="draft.rejection_reason" />
          </UFormField>
        </div>

        <div class="mt-6">
          <UFormField label="Notes">
            <UTextarea class="w-full" v-model="draft.notes" />
          </UFormField>
        </div>

        <div class="mt-6 flex justify-end gap-2">
          <UButton color="neutral" variant="ghost" to="/admin/orders">
            Cancel
          </UButton>
          <UButton color="primary" @click="handleSave">Save Changes</UButton>
        </div>
      </UCard>

      <UCard v-else>
        <p class="text-sm text-slate-600">
          Order not found. Check the URL or return to the orders list.
        </p>
      </UCard>
    </div>
  </div>
</template>
