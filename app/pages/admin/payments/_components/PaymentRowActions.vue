<script setup lang="ts">
import type { Payment } from "~/types/payment";
import { useModal } from "~/composables/admin/useModal";
import ActionConfirmModal from "../../_components/modals/ActionConfirmModal.vue";
import ActionFormModal from "../../_components/modals/ActionFormModal.vue";

type ActionItem = {
  label: string;
  icon: string;
  color?: string;
  to?: string;
  onClick?: () => void | Promise<void>;
};

const props = defineProps<{
  payment: Payment;
}>();

const { openModal } = useModal();
const paymentStore = usePaymentStore();

const paymentId = computed(() => props.payment.id);

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

const toSection = (section: string) =>
  `/admin/payments/${paymentId.value}#${section}`;

const openManualPayment = () => {
  openForm({
    title: "Record Manual Payment",
    confirmLabel: "Record",
    fields: [
      {
        key: "method",
        label: "Payment method",
        placeholder: "cash | card | bank_transfer | mobile_wallet",
        required: true,
      },
      {
        key: "transaction_ref",
        label: "Transaction reference",
        placeholder: "TXN-123456",
      },
    ],
    onSubmit: async (values) => {
      await paymentStore.recordManualPayment(paymentId.value, {
        method: String(values.method ?? "cash") as Payment["method"],
        transaction_ref: String(values.transaction_ref ?? "").trim() || undefined,
      });
    },
  });
};

const openAdjustAmount = () => {
  openForm({
    title: "Adjust Payment Amount",
    confirmLabel: "Update",
    fields: [
      {
        key: "amount",
        label: "New amount",
        type: "number",
        placeholder: "0",
        required: true,
      },
    ],
    onSubmit: async (values) => {
      await paymentStore.adjustPaymentAmount(
        paymentId.value,
        Number(values.amount ?? 0),
      );
    },
  });
};

const openPartialRefund = () => {
  openForm({
    title: "Partial Refund",
    confirmLabel: "Refund",
    confirmColor: "warning",
    fields: [
      {
        key: "amount",
        label: "Refunded amount",
        type: "number",
        placeholder: "0",
        required: true,
      },
    ],
    onSubmit: async (values) => {
      await paymentStore.partialRefund(
        paymentId.value,
        Number(values.amount ?? 0),
      );
    },
  });
};

const viewActions = computed<ActionItem[]>(() => [
  {
    label: "View Payment",
    icon: "i-lucide-eye",
    to: toSection("overview"),
  },
  {
    label: "View Payment Details",
    icon: "i-lucide-clipboard",
    to: toSection("details"),
  },
  {
    label: "View Payment Proof",
    icon: "i-lucide-file-text",
    to: toSection("proof"),
  },
  {
    label: "View Receipt",
    icon: "i-lucide-receipt",
    to: toSection("receipt"),
  },
  {
    label: "View Payment Logs",
    icon: "i-lucide-shield",
    to: toSection("logs"),
  },
]);

const statusActions = computed<ActionItem[]>(() => [
  {
    label: "Verify Payment",
    icon: "i-lucide-check-circle",
    color: "success",
    onClick: () =>
      openConfirm({
        title: "Verify payment",
        description: `Verify ${paymentId.value}?`,
        confirmLabel: "Verify",
        confirmColor: "success",
        onConfirm: () => paymentStore.verifyPayment(paymentId.value),
      }),
  },
  {
    label: "Reject Payment",
    icon: "i-lucide-x-circle",
    color: "error",
    onClick: () =>
      openConfirm({
        title: "Reject payment",
        description: `Reject ${paymentId.value}?`,
        confirmLabel: "Reject",
        confirmColor: "error",
        onConfirm: () => paymentStore.rejectPayment(paymentId.value),
      }),
  },
  {
    label: "Record Manual Payment",
    icon: "i-lucide-edit-3",
    onClick: openManualPayment,
  },
  {
    label: "Mark as Paid",
    icon: "i-lucide-badge-check",
    onClick: () => paymentStore.markPaid(paymentId.value),
  },
  {
    label: "Adjust Payment Amount",
    icon: "i-lucide-calculator",
    onClick: openAdjustAmount,
  },
  {
    label: "Refund Payment",
    icon: "i-lucide-rotate-ccw",
    color: "warning",
    onClick: () =>
      openConfirm({
        title: "Refund payment",
        description: `Refund ${paymentId.value}?`,
        confirmLabel: "Refund",
        confirmColor: "warning",
        onConfirm: () => paymentStore.refundPayment(paymentId.value),
      }),
  },
  {
    label: "Partial Refund",
    icon: "i-lucide-undo-2",
    onClick: openPartialRefund,
  },
]);

const documentActions = computed<ActionItem[]>(() => [
  {
    label: "Generate Receipt",
    icon: "i-lucide-receipt",
    onClick: () => paymentStore.generateReceipt(paymentId.value),
  },
  {
    label: "Print Receipt",
    icon: "i-lucide-printer",
    onClick: () => paymentStore.printReceipt(paymentId.value),
  },
  {
    label: "Download Receipt",
    icon: "i-lucide-download",
    onClick: () => paymentStore.downloadReceipt(paymentId.value),
  },
]);

const communicationActions = computed<ActionItem[]>(() => [
  {
    label: "Send Receipt Email",
    icon: "i-lucide-mail",
    onClick: () => paymentStore.sendReceiptEmail(paymentId.value),
  },
  {
    label: "Send Payment Confirmation",
    icon: "i-lucide-bell",
    onClick: () => paymentStore.sendPaymentConfirmation(paymentId.value),
  },
]);

const adminActions = computed<ActionItem[]>(() => [
  {
    label: "Export Payment",
    icon: "i-lucide-file-export",
    onClick: () => paymentStore.exportPayment(paymentId.value),
  },
  {
    label: "Delete Payment",
    icon: "i-lucide-trash",
    color: "error",
    onClick: () =>
      openConfirm({
        title: "Delete payment",
        description: `Delete ${paymentId.value}? This cannot be undone.`,
        confirmLabel: "Delete",
        confirmColor: "error",
        onConfirm: () => paymentStore.deletePayment(paymentId.value),
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
