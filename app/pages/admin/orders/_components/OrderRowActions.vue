<script setup lang="ts">
import type { Order } from "~/types/order";
import { useModal } from "~/composables/admin/useModal";
import ActionConfirmModal from "../../_components/modals/ActionConfirmModal.vue";
import ActionFormModal from "../../_components/modals/ActionFormModal.vue";
import OrderDetailsModal from "./modals/OrderDetailsModal.vue";
import OrderItemsModal from "./modals/OrderItemsModal.vue";
import OrderTimelineModal from "./modals/OrderTimelineModal.vue";
import OrderPaymentModal from "./modals/OrderPaymentModal.vue";
import OrderDeliveryModal from "./modals/OrderDeliveryModal.vue";
import OrderAuditModal from "./modals/OrderAuditModal.vue";

type ActionItem = {
  label: string;
  icon: string;
  color?: string;
  to?: string;
  onClick?: () => void | Promise<void>;
};

const props = defineProps<{
  order: Order;
}>();

const { openModal } = useModal();
const orderStore = useOrderStore();
const deliveryStore = useDeliveryStore();
const paymentStore = usePaymentStore();

const orderId = computed(() => props.order.id);

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

const openAddItem = () => {
  openForm({
    title: "Add Item",
    description: `Add an item to ${orderId.value}.`,
    confirmLabel: "Add item",
    fields: [
      {
        key: "product_id",
        label: "Product ID",
        placeholder: "prod-001",
        required: true,
      },
      {
        key: "quantity",
        label: "Quantity",
        type: "number",
        placeholder: "1",
        required: true,
      },
      {
        key: "unit_price",
        label: "Unit price",
        type: "number",
        placeholder: "0",
        required: true,
      },
    ],
    onSubmit: async (values) => {
      await orderStore.addOrderItem({
        order_id: orderId.value,
        product_id: String(values.product_id ?? "").trim(),
        quantity: Number(values.quantity ?? 0),
        unit_price: Number(values.unit_price ?? 0),
      });
    },
  });
};

const openUpdateItem = (title: string) => {
  openForm({
    title,
    description: `Update an item on ${orderId.value}.`,
    confirmLabel: "Update item",
    fields: [
      {
        key: "item_id",
        label: "Order item ID",
        placeholder: "item-1001-1",
        required: true,
      },
      {
        key: "quantity",
        label: "Quantity",
        type: "number",
        placeholder: "1",
        required: true,
      },
    ],
    onSubmit: async (values) => {
      await orderStore.updateOrderItem(String(values.item_id ?? ""), {
        quantity: Number(values.quantity ?? 0),
      });
    },
  });
};

const openRemoveItem = () => {
  openForm({
    title: "Remove Item",
    description: `Remove an item from ${orderId.value}.`,
    confirmLabel: "Remove item",
    confirmColor: "error",
    fields: [
      {
        key: "item_id",
        label: "Order item ID",
        placeholder: "item-1001-1",
        required: true,
      },
    ],
    onSubmit: async (values) => {
      await orderStore.removeOrderItem(String(values.item_id ?? ""));
    },
  });
};

const openAssignDelivery = () => {
  openForm({
    title: "Assign Delivery",
    description: "Set driver, vehicle, and schedule.",
    confirmLabel: "Assign",
    fields: [
      {
        key: "driver_id",
        label: "Driver ID",
        placeholder: "drv-001",
      },
      {
        key: "vehicle_number",
        label: "Vehicle number",
        placeholder: "TRK-204",
      },
      {
        key: "scheduled_at",
        label: "Scheduled at",
        type: "datetime-local",
      },
    ],
    onSubmit: async (values) => {
      const delivery = await deliveryStore.ensureDeliveryForOrder(orderId.value);
      if (!delivery) return;

      const scheduled =
        String(values.scheduled_at ?? "").trim() ||
        new Date().toISOString();

      if (values.driver_id) {
        await deliveryStore.assignDriver(delivery.id, String(values.driver_id));
      }
      if (values.vehicle_number) {
        await deliveryStore.assignVehicle(
          delivery.id,
          String(values.vehicle_number),
        );
      }
      await deliveryStore.scheduleDelivery(delivery.id, scheduled);
      orderStore.logOrderActivity(orderId.value, "Delivery assigned");
    },
  });
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
      await deliveryStore.assignDriverByOrder(
        orderId.value,
        String(values.driver_id ?? ""),
      );
      orderStore.logOrderActivity(orderId.value, "Driver assigned");
    },
  });
};

const openScheduleDelivery = (title: string) => {
  openForm({
    title,
    confirmLabel: "Schedule",
    fields: [
      {
        key: "scheduled_at",
        label: "Scheduled at",
        type: "datetime-local",
        required: true,
      },
    ],
    onSubmit: async (values) => {
      await deliveryStore.scheduleDeliveryByOrder(
        orderId.value,
        String(values.scheduled_at ?? ""),
      );
      orderStore.logOrderActivity(orderId.value, title);
    },
  });
};

const openApplyDiscount = () => {
  openForm({
    title: "Apply Discount",
    confirmLabel: "Apply",
    fields: [
      {
        key: "amount",
        label: "Discount amount",
        type: "number",
        placeholder: "0",
        required: true,
      },
    ],
    onSubmit: async (values) => {
      await orderStore.applyOrderDiscount(orderId.value, Number(values.amount));
    },
  });
};

const openUpdateTotal = () => {
  openForm({
    title: "Update Total",
    confirmLabel: "Update",
    fields: [
      {
        key: "total",
        label: "New total",
        type: "number",
        placeholder: "0",
        required: true,
      },
    ],
    onSubmit: async (values) => {
      await orderStore.updateOrderTotal(orderId.value, Number(values.total));
    },
  });
};

const viewActions = computed<ActionItem[]>(() => [
  {
    label: "View Order",
    icon: "i-lucide-eye",
    to: `/admin/orders/${orderId.value}`,
  },
  {
    label: "View Order Details",
    icon: "i-lucide-clipboard",
    onClick: () => openModal(OrderDetailsModal, props.order),
  },
  {
    label: "View Ordered Items",
    icon: "i-lucide-list",
    onClick: () => openModal(OrderItemsModal, props.order),
  },
  {
    label: "View Order Timeline",
    icon: "i-lucide-clock",
    onClick: () => openModal(OrderTimelineModal, props.order),
  },
  {
    label: "View Payment",
    icon: "i-lucide-credit-card",
    onClick: () => openModal(OrderPaymentModal, props.order),
  },
  {
    label: "View Delivery",
    icon: "i-lucide-truck",
    onClick: () => openModal(OrderDeliveryModal, props.order),
  },
]);

const editActions = computed<ActionItem[]>(() => [
  {
    label: "Edit Order",
    icon: "i-lucide-pencil",
    to: `/admin/orders/edit/${orderId.value}`,
  },
  {
    label: "Update Order Items",
    icon: "i-lucide-clipboard-check",
    onClick: () => openUpdateItem("Update Order Items"),
  },
  {
    label: "Update Quantity",
    icon: "i-lucide-hash",
    onClick: () => openUpdateItem("Update Quantity"),
  },
  {
    label: "Add Item",
    icon: "i-lucide-plus-circle",
    onClick: openAddItem,
  },
  {
    label: "Remove Item",
    icon: "i-lucide-minus-circle",
    color: "error",
    onClick: openRemoveItem,
  },
]);

const statusActions = computed<ActionItem[]>(() => [
  {
    label: "Confirm Order",
    icon: "i-lucide-check-circle",
    color: "success",
    onClick: () =>
      openConfirm({
        title: "Confirm order",
        description: `Approve ${orderId.value}?`,
        confirmLabel: "Confirm",
        confirmColor: "success",
        onConfirm: () => orderStore.updateOrderStatus(orderId.value, "approved"),
      }),
  },
  {
    label: "Start Processing",
    icon: "i-lucide-play",
    onClick: () =>
      orderStore.logOrderActivity(orderId.value, "Processing started"),
  },
  {
    label: "Mark Ready for Packing",
    icon: "i-lucide-box",
    onClick: () =>
      orderStore.logOrderActivity(orderId.value, "Ready for packing"),
  },
  {
    label: "Mark Packed",
    icon: "i-lucide-package-check",
    onClick: () => orderStore.logOrderActivity(orderId.value, "Packed"),
  },
  {
    label: "Assign Delivery",
    icon: "i-lucide-map-pin",
    onClick: openAssignDelivery,
  },
  {
    label: "Assign Driver",
    icon: "i-lucide-user-check",
    onClick: openAssignDriver,
  },
  {
    label: "Schedule Delivery",
    icon: "i-lucide-calendar",
    onClick: () => openScheduleDelivery("Schedule Delivery"),
  },
  {
    label: "Reschedule Delivery",
    icon: "i-lucide-calendar-clock",
    onClick: () => openScheduleDelivery("Reschedule Delivery"),
  },
  {
    label: "Mark Out for Delivery",
    icon: "i-lucide-truck",
    onClick: async () => {
      await deliveryStore.updateDeliveryStatusByOrder(
        orderId.value,
        "in_transit",
      );
      orderStore.logOrderActivity(orderId.value, "Out for delivery");
    },
  },
  {
    label: "Mark Delivered",
    icon: "i-lucide-check",
    onClick: async () => {
      await deliveryStore.updateDeliveryStatusByOrder(
        orderId.value,
        "delivered",
      );
      await orderStore.updateOrderStatus(orderId.value, "completed");
    },
  },
  {
    label: "Cancel Order",
    icon: "i-lucide-x-circle",
    color: "error",
    onClick: () =>
      openConfirm({
        title: "Cancel order",
        description: `Cancel ${orderId.value}?`,
        confirmLabel: "Cancel order",
        confirmColor: "error",
        onConfirm: async () => {
          const currentDelivery = deliveryStore.getDeliveryByOrderId(orderId.value);
          if (currentDelivery) {
            await deliveryStore.updateDeliveryStatus(currentDelivery.id, "cancelled");
          }
          await orderStore.updateOrderStatus(orderId.value, "cancelled");
        },
      }),
  },
  {
    label: "Return Order",
    icon: "i-lucide-rotate-ccw",
    onClick: () =>
      openConfirm({
        title: "Return order",
        description: `Mark ${orderId.value} as returned?`,
        confirmLabel: "Return order",
        confirmColor: "warning",
        onConfirm: () =>
          orderStore.updateOrderStatus(orderId.value, "rejected", "Returned"),
      }),
  },
]);

const financialActions = computed<ActionItem[]>(() => [
  {
    label: "Mark as Paid",
    icon: "i-lucide-badge-check",
    onClick: () =>
      paymentStore.markPaidForOrder(
        orderId.value,
        props.order.total_amount,
      ),
  },
  {
    label: "Apply Discount",
    icon: "i-lucide-tag",
    onClick: openApplyDiscount,
  },
  {
    label: "Update Total",
    icon: "i-lucide-calculator",
    onClick: openUpdateTotal,
  },
]);

const documentActions = computed<ActionItem[]>(() => [
  {
    label: "Print Invoice",
    icon: "i-lucide-printer",
    onClick: () => orderStore.printOrderDocument(orderId.value, "invoice"),
  },
  {
    label: "Download Invoice",
    icon: "i-lucide-download",
    onClick: () => orderStore.downloadOrderDocument(orderId.value, "invoice"),
  },
  {
    label: "Print Packing Slip",
    icon: "i-lucide-package",
    onClick: () => orderStore.printOrderDocument(orderId.value, "packing-slip"),
  },
  {
    label: "Download Order PDF",
    icon: "i-lucide-file-down",
    onClick: () => orderStore.downloadOrderDocument(orderId.value, "order-pdf"),
  },
]);

const communicationActions = computed<ActionItem[]>(() => [
  {
    label: "Send Invoice Email",
    icon: "i-lucide-mail",
    onClick: () =>
      orderStore.sendOrderCommunication(orderId.value, "invoice-email"),
  },
  {
    label: "Send Order Notification",
    icon: "i-lucide-bell",
    onClick: () =>
      orderStore.sendOrderCommunication(orderId.value, "order-notification"),
  },
]);

const adminActions = computed<ActionItem[]>(() => [
  {
    label: "Duplicate Order",
    icon: "i-lucide-copy",
    onClick: () => orderStore.duplicateOrder(orderId.value),
  },
  {
    label: "Export Order",
    icon: "i-lucide-file-export",
    onClick: () => orderStore.exportOrder(orderId.value),
  },
  {
    label: "Delete Order",
    icon: "i-lucide-trash",
    color: "error",
    onClick: () =>
      openConfirm({
        title: "Delete order",
        description: `Delete ${orderId.value}? This cannot be undone.`,
        confirmLabel: "Delete",
        confirmColor: "error",
        onConfirm: () => orderStore.deleteOrder(orderId.value),
      }),
  },
  {
    label: "View Audit Logs",
    icon: "i-lucide-shield",
    onClick: () => openModal(OrderAuditModal, props.order),
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
            Financial Actions
          </p>
          <UButton
            v-for="action in financialActions"
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
