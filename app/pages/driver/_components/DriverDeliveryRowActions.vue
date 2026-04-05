<script setup lang="ts">
import type { DriverAssignedOrder } from "~/types/order";
import { useAdminResponseToast } from "~/composables/admin/useAdminResponseToast";
import { useModal } from "~/composables/admin/useModal";
import AdminActionMenu from "~/pages/admin/_components/AdminActionMenu.vue";
import type {
  AdminActionItem,
  AdminActionSection,
} from "~/pages/admin/_components/admin-table";
import ActionConfirmModal from "~/pages/admin/_components/modals/ActionConfirmModal.vue";

const props = defineProps<{
  order: DriverAssignedOrder;
  scope: "assigned" | "completed";
  driverId: string;
}>();

const emit = defineEmits<{
  (e: "updated"): void;
}>();

const driverOrdersStore = useDriverOrdersStore();
const { openModal } = useModal();
const { notifyResponse } = useAdminResponseToast();

const delivery = computed(() => props.order.delivery ?? null);

const canMarkDelivered = computed(
  () =>
    props.scope === "assigned" &&
    delivery.value?.driver_id === props.driverId &&
    !["delivered", "cancelled"].includes(delivery.value?.status ?? ""),
    );

const actions = computed<AdminActionItem[]>(() => {
  const next: AdminActionItem[] = [];

  if (canMarkDelivered.value) {
    next.push({
      label: "Mark as Delivered",
      icon: "i-lucide-circle-check",
      color: "success",
      onClick: () =>
        openModal(ActionConfirmModal, {
          eyebrow: "Complete Delivery",
          title: "Mark this assigned order as delivered?",
          description:
            "This will complete the delivery record and move the related order workflow forward.",
          confirmLabel: "Mark Delivered",
          confirmColor: "success",
          onConfirm: async () => {
            const response = await driverOrdersStore.markOrderDelivered(
              props.driverId,
              props.order.id,
              {
                delivered_at: new Date().toISOString(),
              },
            );

            const ok = notifyResponse(response, {
              successTitle: "Order delivered",
              successDescription: "The assigned order has been marked as delivered.",
              errorTitle: "Order not delivered",
            });

            if (ok) {
              emit("updated");
            }

            return ok;
          },
        }),
    });
  }

  return next;
});

const sections = computed<AdminActionSection[]>(() =>
  actions.value.length
    ? [{ label: "Delivery Actions", actions: actions.value }]
    : [],
);
</script>

<template>
  <AdminActionMenu :sections="sections" />
</template>
