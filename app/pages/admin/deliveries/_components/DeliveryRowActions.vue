<script setup lang="ts">
import type { Delivery } from "~/types/delivery";
import { useModal } from "~/composables/admin/useModal";
import ActionConfirmModal from "../../_components/modals/ActionConfirmModal.vue";
import ActionFormModal from "../../_components/modals/ActionFormModal.vue";
import DeliveryDetailsModal from "./modals/DeliveryDetailsModal.vue";
import DeliveryItemsModal from "./modals/DeliveryItemsModal.vue";
import DeliveryAddressModal from "./modals/DeliveryAddressModal.vue";
import DeliveryTrackingModal from "./modals/DeliveryTrackingModal.vue";

type ActionItem = {
  label: string;
  icon: string;
  color?: string;
  to?: string;
  onClick?: () => void | Promise<void>;
};

const props = defineProps<{
  delivery: Delivery;
}>();

const { openModal } = useModal();
const deliveryStore = useDeliveryStore();

const deliveryId = computed(() => props.delivery.id);

const openConfirm = (payload: {
  title: string;
  description?: string;
  confirmLabel?: string;
  confirmColor?: string;
  onConfirm: () => Promise<void> | void;
}) => {
  openModal(ActionConfirmModal, payload);
};

const openForm = (payload: {
  title: string;
  description?: string;
  fields: Array<{
    key: string;
    label: string;
    type?: string;
    placeholder?: string;
    required?: boolean;
    value?: string | number;
  }>;
  confirmLabel?: string;
  confirmColor?: string;
  onSubmit: (values: Record<string, string | number>) => Promise<void> | void;
}) => {
  openModal(ActionFormModal, payload);
};

const openAssignDriver = () => {
  openForm({
    title: "Assign Driver",
    confirmLabel: "Assign",
    fields: [
      {
        key: "driver_id",
        label: "Driver ID",
        placeholder: "drv-001",
        required: true,
      },
    ],
    onSubmit: async (values) => {
      await deliveryStore.assignDriver(
        deliveryId.value,
        String(values.driver_id ?? ""),
      );
    },
  });
};

const openAssignVehicle = () => {
  openForm({
    title: "Assign Vehicle",
    confirmLabel: "Assign",
    fields: [
      {
        key: "vehicle_number",
        label: "Vehicle number",
        placeholder: "TRK-204",
        required: true,
      },
    ],
    onSubmit: async (values) => {
      await deliveryStore.assignVehicle(
        deliveryId.value,
        String(values.vehicle_number ?? ""),
      );
    },
  });
};

const openAssignStaff = () => {
  openForm({
    title: "Assign Warehouse Staff",
    confirmLabel: "Assign",
    fields: [
      {
        key: "staff",
        label: "Staff name",
        placeholder: "Alex Morgan",
        required: true,
      },
    ],
    onSubmit: async (values) => {
      deliveryStore.assignWarehouseStaff(
        deliveryId.value,
        String(values.staff ?? ""),
      );
    },
  });
};

const openSchedule = (title: string) => {
  openForm({
    title,
    confirmLabel: "Save",
    fields: [
      {
        key: "scheduled_at",
        label: "Scheduled at",
        type: "datetime-local",
        required: true,
      },
    ],
    onSubmit: async (values) => {
      await deliveryStore.scheduleDelivery(
        deliveryId.value,
        String(values.scheduled_at ?? ""),
      );
    },
  });
};

const openUpdateLocation = () => {
  openForm({
    title: "Update Delivery Location",
    confirmLabel: "Update",
    fields: [
      {
        key: "location",
        label: "Current location",
        placeholder: "Warehouse 3 - Dock 2",
        required: true,
      },
    ],
    onSubmit: async (values) => {
      deliveryStore.updateDeliveryLocation(
        deliveryId.value,
        String(values.location ?? ""),
      );
    },
  });
};

const openUpdateRoute = () => {
  openForm({
    title: "Update Delivery Route",
    confirmLabel: "Update",
    fields: [
      {
        key: "route",
        label: "Route",
        placeholder: "Northline -> Summit -> Lakeview",
        required: true,
      },
    ],
    onSubmit: async (values) => {
      deliveryStore.updateDeliveryRoute(
        deliveryId.value,
        String(values.route ?? ""),
      );
    },
  });
};

const viewActions = computed<ActionItem[]>(() => [
  {
    label: "View Delivery",
    icon: "i-lucide-eye",
    to: `/admin/deliveries/${deliveryId.value}`,
  },
  {
    label: "View Delivery Details",
    icon: "i-lucide-clipboard",
    onClick: () => openModal(DeliveryDetailsModal, props.delivery),
  },
  {
    label: "View Delivery Items",
    icon: "i-lucide-list",
    onClick: () => openModal(DeliveryItemsModal, props.delivery),
  },
  {
    label: "View Delivery Address",
    icon: "i-lucide-map-pin",
    onClick: () => openModal(DeliveryAddressModal, props.delivery),
  },
  {
    label: "Track Delivery",
    icon: "i-lucide-navigation",
    onClick: () => openModal(DeliveryTrackingModal, props.delivery),
  },
]);

const editActions = computed<ActionItem[]>(() => [
  {
    label: "Edit Delivery",
    icon: "i-lucide-pencil",
    to: `/admin/deliveries/edit/${deliveryId.value}`,
  },
]);

const assignmentActions = computed<ActionItem[]>(() => [
  {
    label: "Assign Driver",
    icon: "i-lucide-user-check",
    onClick: openAssignDriver,
  },
  {
    label: "Assign Vehicle",
    icon: "i-lucide-truck",
    onClick: openAssignVehicle,
  },
  {
    label: "Assign Warehouse Staff",
    icon: "i-lucide-users",
    onClick: openAssignStaff,
  },
]);

const scheduleActions = computed<ActionItem[]>(() => [
  {
    label: "Schedule Delivery",
    icon: "i-lucide-calendar",
    onClick: () => openSchedule("Schedule Delivery"),
  },
  {
    label: "Reschedule Delivery",
    icon: "i-lucide-calendar-clock",
    onClick: () => openSchedule("Reschedule Delivery"),
  },
  {
    label: "Delay Delivery",
    icon: "i-lucide-clock-3",
    onClick: () => openSchedule("Delay Delivery"),
  },
]);

const statusActions = computed<ActionItem[]>(() => [
  {
    label: "Mark Preparing",
    icon: "i-lucide-clipboard-list",
    onClick: () =>
      deliveryStore.logDeliveryActivity(deliveryId.value, "Preparing"),
  },
  {
    label: "Mark Packed",
    icon: "i-lucide-package-check",
    onClick: () => deliveryStore.logDeliveryActivity(deliveryId.value, "Packed"),
  },
  {
    label: "Mark Out for Delivery",
    icon: "i-lucide-truck",
    onClick: () =>
      deliveryStore.updateDeliveryStatus(deliveryId.value, "in_transit"),
  },
  {
    label: "Mark Delivered",
    icon: "i-lucide-check",
    onClick: () =>
      deliveryStore.updateDeliveryStatus(deliveryId.value, "delivered"),
  },
  {
    label: "Mark Failed Delivery",
    icon: "i-lucide-alert-triangle",
    color: "error",
    onClick: () =>
      deliveryStore.updateDeliveryStatus(deliveryId.value, "failed"),
  },
  {
    label: "Return to Warehouse",
    icon: "i-lucide-rotate-ccw",
    onClick: () =>
      deliveryStore.logDeliveryActivity(deliveryId.value, "Returned to warehouse"),
  },
]);

const routeActions = computed<ActionItem[]>(() => [
  {
    label: "Update Delivery Location",
    icon: "i-lucide-map",
    onClick: openUpdateLocation,
  },
  {
    label: "Update Delivery Route",
    icon: "i-lucide-route",
    onClick: openUpdateRoute,
  },
]);

const documentActions = computed<ActionItem[]>(() => [
  {
    label: "Print Delivery Receipt",
    icon: "i-lucide-printer",
    onClick: () =>
      deliveryStore.printDeliveryDocument(deliveryId.value, "delivery-receipt"),
  },
  {
    label: "Download Delivery Slip",
    icon: "i-lucide-download",
    onClick: () =>
      deliveryStore.downloadDeliveryDocument(deliveryId.value, "delivery-slip"),
  },
  {
    label: "Print Packing List",
    icon: "i-lucide-package",
    onClick: () =>
      deliveryStore.printDeliveryDocument(deliveryId.value, "packing-list"),
  },
]);

const communicationActions = computed<ActionItem[]>(() => [
  {
    label: "Send Delivery Notification",
    icon: "i-lucide-bell",
    onClick: () =>
      deliveryStore.sendDeliveryCommunication(
        deliveryId.value,
        "delivery-notification",
      ),
  },
  {
    label: "Send Tracking Link",
    icon: "i-lucide-link",
    onClick: () =>
      deliveryStore.sendDeliveryCommunication(
        deliveryId.value,
        "tracking-link",
      ),
  },
]);

const adminActions = computed<ActionItem[]>(() => [
  {
    label: "Export Delivery",
    icon: "i-lucide-file-export",
    onClick: () => deliveryStore.exportDelivery(deliveryId.value),
  },
  {
    label: "Delete Delivery",
    icon: "i-lucide-trash",
    color: "error",
    onClick: () =>
      openConfirm({
        title: "Delete delivery",
        description: `Delete ${deliveryId.value}? This cannot be undone.`,
        confirmLabel: "Delete",
        confirmColor: "error",
        onConfirm: () => deliveryStore.deleteDelivery(deliveryId.value),
      }),
  },
]);

const handleAction = async (action: ActionItem, close: () => void) => {
  if (action.onClick) {
    await action.onClick();
  }
  close();
};
</script>

<template>
  <UPopover :dismissible="false" :ui="{ content: 'p-4' }">
    <UButton
      icon="i-lucide-ellipsis-vertical"
      variant="ghost"
      color="neutral"
      size="sm"
    />

    <template #content="{ close }">
      <div class="flex items-center justify-between gap-4 mb-4 w-full">
        <h2 class="text-highlighted font-semibold">Actions</h2>

        <UButton
          color="neutral"
          variant="ghost"
          icon="i-lucide-x"
          @click="close"
        />
      </div>

      <div class="flex flex-col gap-3 min-w-64">
        <div class="flex flex-col gap-1">
          <p class="px-2 text-xs uppercase tracking-[0.18em] text-slate-500">
            View Actions
          </p>
          <UButton
            v-for="action in viewActions"
            :key="action.label"
            :icon="action.icon"
            :color="action.color ?? 'neutral'"
            variant="ghost"
            size="sm"
            class="w-full justify-start"
            :to="action.to"
            @click="handleAction(action, close)"
          >
            {{ action.label }}
          </UButton>
        </div>

        <UDivider />

        <div class="flex flex-col gap-1">
          <p class="px-2 text-xs uppercase tracking-[0.18em] text-slate-500">
            Edit Actions
          </p>
          <UButton
            v-for="action in editActions"
            :key="action.label"
            :icon="action.icon"
            :color="action.color ?? 'neutral'"
            variant="ghost"
            size="sm"
            class="w-full justify-start"
            :to="action.to"
            @click="handleAction(action, close)"
          >
            {{ action.label }}
          </UButton>
        </div>

        <UDivider />

        <div class="flex flex-col gap-1">
          <p class="px-2 text-xs uppercase tracking-[0.18em] text-slate-500">
            Assignments
          </p>
          <UButton
            v-for="action in assignmentActions"
            :key="action.label"
            :icon="action.icon"
            :color="action.color ?? 'neutral'"
            variant="ghost"
            size="sm"
            class="w-full justify-start"
            :to="action.to"
            @click="handleAction(action, close)"
          >
            {{ action.label }}
          </UButton>
        </div>

        <UDivider />

        <div class="flex flex-col gap-1">
          <p class="px-2 text-xs uppercase tracking-[0.18em] text-slate-500">
            Scheduling
          </p>
          <UButton
            v-for="action in scheduleActions"
            :key="action.label"
            :icon="action.icon"
            :color="action.color ?? 'neutral'"
            variant="ghost"
            size="sm"
            class="w-full justify-start"
            :to="action.to"
            @click="handleAction(action, close)"
          >
            {{ action.label }}
          </UButton>
        </div>

        <UDivider />

        <div class="flex flex-col gap-1">
          <p class="px-2 text-xs uppercase tracking-[0.18em] text-slate-500">
            Status Updates
          </p>
          <UButton
            v-for="action in statusActions"
            :key="action.label"
            :icon="action.icon"
            :color="action.color ?? 'neutral'"
            variant="ghost"
            size="sm"
            class="w-full justify-start"
            :to="action.to"
            @click="handleAction(action, close)"
          >
            {{ action.label }}
          </UButton>
        </div>

        <UDivider />

        <div class="flex flex-col gap-1">
          <p class="px-2 text-xs uppercase tracking-[0.18em] text-slate-500">
            Routing
          </p>
          <UButton
            v-for="action in routeActions"
            :key="action.label"
            :icon="action.icon"
            :color="action.color ?? 'neutral'"
            variant="ghost"
            size="sm"
            class="w-full justify-start"
            :to="action.to"
            @click="handleAction(action, close)"
          >
            {{ action.label }}
          </UButton>
        </div>

        <UDivider />

        <div class="flex flex-col gap-1">
          <p class="px-2 text-xs uppercase tracking-[0.18em] text-slate-500">
            Documents
          </p>
          <UButton
            v-for="action in documentActions"
            :key="action.label"
            :icon="action.icon"
            :color="action.color ?? 'neutral'"
            variant="ghost"
            size="sm"
            class="w-full justify-start"
            :to="action.to"
            @click="handleAction(action, close)"
          >
            {{ action.label }}
          </UButton>
        </div>

        <UDivider />

        <div class="flex flex-col gap-1">
          <p class="px-2 text-xs uppercase tracking-[0.18em] text-slate-500">
            Communication
          </p>
          <UButton
            v-for="action in communicationActions"
            :key="action.label"
            :icon="action.icon"
            :color="action.color ?? 'neutral'"
            variant="ghost"
            size="sm"
            class="w-full justify-start"
            :to="action.to"
            @click="handleAction(action, close)"
          >
            {{ action.label }}
          </UButton>
        </div>

        <UDivider />

        <div class="flex flex-col gap-1">
          <p class="px-2 text-xs uppercase tracking-[0.18em] text-slate-500">
            Admin Actions
          </p>
          <UButton
            v-for="action in adminActions"
            :key="action.label"
            :icon="action.icon"
            :color="action.color ?? 'neutral'"
            variant="ghost"
            size="sm"
            class="w-full justify-start"
            :to="action.to"
            @click="handleAction(action, close)"
          >
            {{ action.label }}
          </UButton>
        </div>
      </div>
    </template>
  </UPopover>
</template>
